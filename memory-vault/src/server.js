import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { db, FILES_DIR } from './db.js';
import {
  COOKIE_NAME, SESSION_DAYS, DUMMY_HASH, verifyPassword, createSession, findSession,
  destroySession, purgeExpiredSessions, parseCookies, safeEqual,
} from './auth.js';
import { sniff } from './sniff.js';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';              // listen on localhost only; put a TLS proxy in front
const SECURE = process.env.COOKIE_SECURE === '1';          // set to 1 when served over HTTPS
const MAX_UPLOAD = Number(process.env.MAX_UPLOAD_MB || 8192) * 1024 * 1024;
const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : process.env.TRUST_PROXY);

// ---------- security headers ----------
app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' blob:; media-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'X-Robots-Tag': 'noindex, nofollow',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  });
  if (SECURE) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.get('/robots.txt', (req, res) => res.type('text/plain').send('User-agent: *\nDisallow: /\n'));
app.use(express.static(PUBLIC_DIR, { index: 'index.html', dotfiles: 'deny', maxAge: 0 }));

// ---------- helpers ----------
const getToken = (req) => parseCookies(req.headers.cookie)[COOKIE_NAME];

function setSessionCookie(res, token) {
  const attrs = [`${COOKIE_NAME}=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${SESSION_DAYS * 86400}`];
  if (SECURE) attrs.push('Secure');
  res.append('Set-Cookie', attrs.join('; '));
}
function clearSessionCookie(res) {
  res.append('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${SECURE ? '; Secure' : ''}`);
}

function requireAuth(req, res, next) {
  const s = findSession(getToken(req));
  if (!s) return res.status(401).json({ error: 'Not signed in' });
  req.session = s;
  res.set('Cache-Control', 'no-store');
  // CSRF defence in depth: SameSite=Strict cookie + Origin check + per-session token on every write.
  if (!['GET', 'HEAD'].includes(req.method)) {
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'Bad origin' });
    if (!safeEqual(req.headers['x-csrf-token'] || '', s.csrf)) return res.status(403).json({ error: 'Bad CSRF token' });
  }
  next();
}

// ---------- login rate limiting (in memory; resets on restart) ----------
const attempts = new Map(); // key -> { count, lockedUntil }
const MAX_FAILS = 5, LOCK_MS = 15 * 60 * 1000;
const keysFor = (req, username) => [`ip:${req.ip}`, `u:${String(username).toLowerCase()}`];
function isLocked(keys) {
  const now = Date.now();
  return keys.some((k) => (attempts.get(k)?.lockedUntil || 0) > now);
}
function recordFail(keys) {
  for (const k of keys) {
    const a = attempts.get(k) || { count: 0, lockedUntil: 0 };
    a.count += 1;
    if (a.count >= MAX_FAILS) { a.lockedUntil = Date.now() + LOCK_MS; a.count = 0; }
    attempts.set(k, a);
  }
}
const clearFails = (keys) => keys.forEach((k) => attempts.delete(k));

// ---------- auth routes ----------
app.post('/api/login', express.json({ limit: '4kb' }), async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || password.length > 256) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  const keys = keysFor(req, username);
  if (isLocked(keys)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });

  const user = db.prepare('SELECT id, password_hash FROM users WHERE username = ?').get(username);
  const ok = await verifyPassword(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) {
    recordFail(keys);
    return res.status(401).json({ error: 'Wrong username or password' });
  }
  clearFails(keys);
  setSessionCookie(res, createSession(user.id));
  res.set('Cache-Control', 'no-store').json({ ok: true });
});

app.post('/api/logout', requireAuth, (req, res) => {
  destroySession(getToken(req));
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  const s = findSession(getToken(req));
  res.set('Cache-Control', 'no-store');
  if (!s) return res.status(401).json({ error: 'Not signed in' });
  res.json({ username: s.username, csrf: s.csrf });
});

// ---------- media: list / read / update / delete ----------
const PUBLIC_COLS = 'id, kind, mime, original_name, size, title, note, tags, taken_on, created_at';

app.get('/api/media', requireAuth, (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 100);
  const kind = ['image', 'video'].includes(req.query.kind) ? req.query.kind : null;
  const where = ['user_id = ?'], args = [req.session.user_id];
  if (kind) { where.push('kind = ?'); args.push(kind); }
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
    where.push("(title LIKE ? ESCAPE '\\' OR note LIKE ? ESCAPE '\\' OR tags LIKE ? ESCAPE '\\' OR original_name LIKE ? ESCAPE '\\')");
    args.push(like, like, like, like);
  }
  const rows = db.prepare(`SELECT ${PUBLIC_COLS} FROM media WHERE ${where.join(' AND ')}
    ORDER BY COALESCE(NULLIF(taken_on,''), date(created_at/1000,'unixepoch')) DESC, created_at DESC LIMIT 2000`).all(...args);
  res.json(rows);
});

// Every lookup is scoped by user_id, so one user can never reach another user's item.
const ownMedia = (req) => db.prepare('SELECT * FROM media WHERE id = ? AND user_id = ?').get(req.params.id, req.session.user_id);

app.get('/api/media/:id', requireAuth, (req, res) => {
  const m = ownMedia(req);
  if (!m) return res.status(404).json({ error: 'Not found' });
  const { storage_name, user_id, ...pub } = m;
  res.json(pub);
});

app.patch('/api/media/:id', requireAuth, express.json({ limit: '200kb' }), (req, res) => {
  const m = ownMedia(req);
  if (!m) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const str = (v, max, fallback) => (typeof v === 'string' ? v.slice(0, max) : fallback);
  const taken = str(b.taken_on, 10, m.taken_on);
  if (taken && !/^\d{4}-\d{2}-\d{2}$/.test(taken)) return res.status(400).json({ error: 'Date must be YYYY-MM-DD' });
  db.prepare('UPDATE media SET title=?, note=?, tags=?, taken_on=?, updated_at=? WHERE id=?').run(
    str(b.title, 200, m.title), str(b.note, 50000, m.note), str(b.tags, 300, m.tags), taken, Date.now(), m.id);
  res.json({ ok: true });
});

app.delete('/api/media/:id', requireAuth, (req, res) => {
  const m = ownMedia(req);
  if (!m) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM media WHERE id = ?').run(m.id);
  fs.promises.unlink(path.join(FILES_DIR, m.storage_name)).catch(() => {});
  res.json({ ok: true });
});

// ---------- media: serve the ORIGINAL bytes (login required, Range supported for video seeking) ----------
app.get('/api/media/:id/file', requireAuth, async (req, res) => {
  const m = ownMedia(req);
  if (!m) return res.status(404).end();
  const file = path.join(FILES_DIR, m.storage_name);
  let st;
  try { st = await fs.promises.stat(file); } catch { return res.status(404).end(); }

  const etag = `"${m.storage_name.slice(0, 16)}-${st.size}"`;
  const safeName = (m.original_name || 'file').replace(/[\r\n"]/g, '_');
  const disp = req.query.download === '1' ? 'attachment' : 'inline';
  res.set({
    'Content-Type': m.mime,
    'Content-Disposition': `${disp}; filename*=UTF-8''${encodeURIComponent(safeName)}`,
    'Cache-Control': 'private, no-cache',   // browser may keep it but must re-check login each time
    ETag: etag,
    'Accept-Ranges': 'bytes',
  });

  let start = 0, end = st.size - 1, status = 200;
  const range = req.headers.range;
  if (range) {
    const mt = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!mt || (mt[1] === '' && mt[2] === '')) return res.status(416).set('Content-Range', `bytes */${st.size}`).end();
    if (mt[1] === '') { start = Math.max(0, st.size - Number(mt[2])); }
    else { start = Number(mt[1]); if (mt[2] !== '') end = Math.min(end, Number(mt[2])); }
    if (start > end || start >= st.size) return res.status(416).set('Content-Range', `bytes */${st.size}`).end();
    status = 206;
    res.set('Content-Range', `bytes ${start}-${end}/${st.size}`);
  } else if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  res.status(status).set('Content-Length', String(end - start + 1));
  if (req.method === 'HEAD') return res.end();
  const stream = fs.createReadStream(file, { start, end });
  stream.on('error', () => res.destroy());
  res.on('close', () => stream.destroy());
  stream.pipe(res);
});

// ---------- upload: raw body streamed straight to disk, no re-encoding, so quality is untouched ----------
class UploadGuard extends Transform {
  constructor(max) { super(); this.max = max; this.size = 0; this.head = Buffer.alloc(0); this.type = null; }
  _check(final) {
    if (this.type) return null;
    const t = sniff(this.head);
    if (t) this.type = t;
    else if (final || this.head.length >= 64) return Object.assign(new Error('Unsupported file type (images and videos only)'), { status: 415 });
    return null;
  }
  _transform(chunk, _enc, cb) {
    this.size += chunk.length;
    if (this.size > this.max) return cb(Object.assign(new Error('File too large'), { status: 413 }));
    if (!this.type) { this.head = Buffer.concat([this.head, chunk.subarray(0, 64)]).subarray(0, 64); const e = this._check(false); if (e) return cb(e); }
    cb(null, chunk);
  }
  _flush(cb) { cb(this._check(true)); }
}

app.post('/api/media', requireAuth, async (req, res) => {
  const declared = Number(req.headers['content-length']);
  if (!declared) return res.status(411).json({ error: 'Content-Length required' });
  if (declared > MAX_UPLOAD) return res.status(413).json({ error: 'File too large' });

  let name = 'untitled';
  try { name = decodeURIComponent(String(req.headers['x-filename'] || 'untitled')); } catch { /* keep default */ }
  name = path.basename(name).replace(/[\u0000-\u001f]/g, '').slice(0, 200) || 'untitled';

  const storage = crypto.randomBytes(24).toString('hex');
  const tmp = path.join(FILES_DIR, `${storage}.part`);
  const guard = new UploadGuard(MAX_UPLOAD);
  try {
    await pipeline(req, guard, fs.createWriteStream(tmp, { mode: 0o600, flags: 'wx' }));
    if (guard.size !== declared) throw Object.assign(new Error('Incomplete upload'), { status: 400 });
    await fs.promises.rename(tmp, path.join(FILES_DIR, storage));
  } catch (err) {
    fs.promises.unlink(tmp).catch(() => {});
    return res.status(err.status || 500).json({ error: err.status ? err.message : 'Upload failed' });
  }

  const id = crypto.randomBytes(12).toString('hex');
  const now = Date.now();
  const takenOn = /^\d{4}-\d{2}-\d{2}$/.test(String(req.headers['x-taken-on'] || '')) ? req.headers['x-taken-on'] : '';
  db.prepare(`INSERT INTO media (id,user_id,kind,mime,original_name,size,storage_name,taken_on,created_at,updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(id, req.session.user_id, guard.type.kind, guard.type.mime, name, guard.size, storage, takenOn, now, now);
  res.status(201).json({ id });
});

// ---------- misc ----------
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status && err.status < 500 ? err.status : 500;
  res.status(status).json({ error: status === 500 ? 'Server error' : 'Bad request' });
  if (status === 500) console.error(err);
});

purgeExpiredSessions();
setInterval(purgeExpiredSessions, 60 * 60 * 1000).unref();

app.listen(PORT, HOST, () => {
  console.log(`Memory Vault listening on http://${HOST}:${PORT}${SECURE ? ' (secure cookies)' : ''}`);
  if (!db.prepare('SELECT 1 FROM users LIMIT 1').get()) console.log('No users yet. Create one with: npm run create-user -- <username>');
});
