import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';
import { storage, storageOrigin, driver } from './storage.js';
import {
  COOKIE_NAME, SESSION_DAYS, DUMMY_HASH, verifyPassword, createSession, findSession,
  destroySession, purgeExpiredSessions, parseCookies, safeEqual,
} from './auth.js';
import { sniff } from './sniff.js';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';              // listen on localhost only; put a TLS proxy in front
const SECURE = process.env.COOKIE_SECURE === '1';          // set to 1 when served over HTTPS
// R2 accepts a single upload of up to 5 GiB; larger files would need multipart uploads.
const MAX_UPLOAD = Math.min(Number(process.env.MAX_UPLOAD_MB || 5000), storage.direct ? 5000 : 1e9) * 1024 * 1024;
const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : process.env.TRUST_PROXY);

// ---------- security headers ----------
const ext = storageOrigin ? ` ${storageOrigin}` : '';
const CSP = [
  "default-src 'none'", "script-src 'self'", "style-src 'self'", "font-src 'self'",
  `img-src 'self' data: blob:${ext}`, `media-src 'self' blob:${ext}`, `connect-src 'self'${ext}`,
  "form-action 'self'", "base-uri 'none'", "frame-ancestors 'none'",
].join('; ');
app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': CSP,
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
const rid = (n = 12) => crypto.randomBytes(n).toString('hex');
const getToken = (req) => parseCookies(req.headers.cookie)[COOKIE_NAME];
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s));
const str = (v, max, fallback) => (typeof v === 'string' ? v.slice(0, max) : fallback);

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
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- login rate limiting (in memory; resets on restart) ----------
const attempts = new Map(); // key -> { count, lockedUntil }
const MAX_FAILS = 5, LOCK_MS = 15 * 60 * 1000;
const keysFor = (req, username) => [`ip:${req.ip}`, `u:${String(username).toLowerCase()}`];
const isLocked = (keys) => keys.some((k) => (attempts.get(k)?.lockedUntil || 0) > Date.now());
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
app.post('/api/login', express.json({ limit: '4kb' }), wrap(async (req, res) => {
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
}));

app.post('/api/logout', requireAuth, (req, res) => {
  destroySession(getToken(req));
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  const s = findSession(getToken(req));
  res.set('Cache-Control', 'no-store');
  if (!s) return res.status(401).json({ error: 'Not signed in' });
  res.json({ username: s.username, csrf: s.csrf, maxUploadBytes: MAX_UPLOAD, storage: driver });
});

// ---------- library ----------
app.get('/api/library', requireAuth, (req, res) => {
  const uid = req.session.user_id;
  const media = db.prepare(`SELECT id, kind, mime, original_name, size, title, note, tags, taken_on, series_id, position, created_at
    FROM media WHERE user_id = ? AND status = 'ready' ORDER BY position, created_at LIMIT 20000`).all(uid);
  const series = db.prepare('SELECT id, title, note, tags, taken_on, cover_id, created_at FROM series WHERE user_id = ?').all(uid);
  res.json({ media, series });
});

// Every lookup is scoped by user_id, so one user can never reach another user's item.
const ownMedia = (req) => db.prepare("SELECT * FROM media WHERE id = ? AND user_id = ? AND status = 'ready'").get(req.params.id, req.session.user_id);
const ownSeries = (req) => db.prepare('SELECT * FROM series WHERE id = ? AND user_id = ?').get(req.params.id, req.session.user_id);

app.patch('/api/media/:id', requireAuth, express.json({ limit: '200kb' }), (req, res) => {
  const m = ownMedia(req);
  if (!m) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const taken = str(b.taken_on, 10, m.taken_on);
  if (taken && !isDate(taken)) return res.status(400).json({ error: 'Date must be YYYY-MM-DD' });
  db.prepare('UPDATE media SET title=?, note=?, tags=?, taken_on=?, updated_at=? WHERE id=?').run(
    str(b.title, 200, m.title), str(b.note, 50000, m.note), str(b.tags, 300, m.tags), taken, Date.now(), m.id);
  res.json({ ok: true });
});

// After items leave a series: drop empty series, and give a series a new cover if its cover moved away.
function tidySeries(uid) {
  db.prepare('DELETE FROM series WHERE user_id = ? AND id NOT IN (SELECT DISTINCT series_id FROM media WHERE series_id IS NOT NULL)').run(uid);
  db.prepare(`UPDATE series SET cover_id = (SELECT id FROM media WHERE series_id = series.id ORDER BY position LIMIT 1)
    WHERE user_id = ? AND (cover_id IS NULL OR cover_id NOT IN (SELECT id FROM media WHERE series_id = series.id))`).run(uid);
}

app.delete('/api/media/:id', requireAuth, wrap(async (req, res) => {
  const m = ownMedia(req);
  if (!m) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM media WHERE id = ?').run(m.id);
  tidySeries(req.session.user_id);
  await storage.remove(m.storage_name);
  res.json({ ok: true });
}));

// ---------- series ----------
function validIds(req, ids) {
  if (!Array.isArray(ids) || !ids.length || ids.length > 2000 || ids.some((i) => typeof i !== 'string') || new Set(ids).size !== ids.length) return false;
  const marks = ids.map(() => '?').join(',');
  const n = db.prepare(`SELECT COUNT(*) AS n FROM media WHERE user_id = ? AND status = 'ready' AND id IN (${marks})`).get(req.session.user_id, ...ids).n;
  return n === ids.length;
}
function setItems(sid, uid, ids) {
  if (!ids.length) { db.prepare('UPDATE media SET series_id = NULL WHERE user_id = ? AND series_id = ?').run(uid, sid); return; }
  const marks = ids.map(() => '?').join(',');
  db.prepare(`UPDATE media SET series_id = NULL WHERE user_id = ? AND series_id = ? AND id NOT IN (${marks})`).run(uid, sid, ...ids);
  const upd = db.prepare("UPDATE media SET series_id = ?, position = ? WHERE id = ? AND user_id = ? AND status = 'ready'");
  ids.forEach((id, i) => upd.run(sid, i, id, uid));
}
function inTx(fn) {
  db.exec('BEGIN');
  try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; }
}

app.post('/api/series', requireAuth, express.json({ limit: '200kb' }), (req, res) => {
  const b = req.body || {};
  if (!validIds(req, b.ids)) return res.status(400).json({ error: 'Pick existing photos or videos' });
  const taken = str(b.taken_on, 10, '');
  if (taken && !isDate(taken)) return res.status(400).json({ error: 'Date must be YYYY-MM-DD' });
  const id = rid(), now = Date.now(), uid = req.session.user_id;
  inTx(() => {
    db.prepare('INSERT INTO series (id,user_id,title,note,tags,taken_on,cover_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(id, uid, str(b.title, 200, '') || 'New series', str(b.note, 50000, ''), str(b.tags, 300, ''), taken, b.ids[0], now, now);
    setItems(id, uid, b.ids);
    tidySeries(uid);
  });
  res.status(201).json({ id });
});

app.patch('/api/series/:id', requireAuth, express.json({ limit: '200kb' }), (req, res) => {
  const s = ownSeries(req);
  if (!s) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {}, uid = req.session.user_id;
  const taken = str(b.taken_on, 10, s.taken_on);
  if (taken && !isDate(taken)) return res.status(400).json({ error: 'Date must be YYYY-MM-DD' });
  // An empty list dissolves the series (its photos become separate items).
  const dissolve = Array.isArray(b.ids) && b.ids.length === 0;
  if (b.ids !== undefined && !dissolve && !validIds(req, b.ids)) return res.status(400).json({ error: 'Invalid photo list' });
  inTx(() => {
    if (b.ids) setItems(s.id, uid, b.ids);
    const cover = typeof b.cover_id === 'string' ? b.cover_id : s.cover_id;
    db.prepare('UPDATE series SET title=?, note=?, tags=?, taken_on=?, cover_id=?, updated_at=? WHERE id=?').run(
      str(b.title, 200, s.title), str(b.note, 50000, s.note), str(b.tags, 300, s.tags), taken, cover, Date.now(), s.id);
    tidySeries(uid);
  });
  res.json({ ok: true });
});

// Deleting a series deletes its photos and videos too (a photo can be moved out first).
app.delete('/api/series/:id', requireAuth, wrap(async (req, res) => {
  const s = ownSeries(req);
  if (!s) return res.status(404).json({ error: 'Not found' });
  const files = db.prepare('SELECT id, storage_name FROM media WHERE series_id = ? AND user_id = ?').all(s.id, req.session.user_id);
  inTx(() => {
    db.prepare('DELETE FROM media WHERE series_id = ? AND user_id = ?').run(s.id, req.session.user_id);
    db.prepare('DELETE FROM series WHERE id = ?').run(s.id);
  });
  await Promise.all(files.map((f) => storage.remove(f.storage_name)));
  res.json({ ok: true });
}));

// ---------- upload: init -> PUT the original bytes -> complete ----------
// 1) init   : the app records a pending item and returns where to PUT the file (R2 signed URL, or this server).
// 2) PUT    : the browser sends the file untouched, so quality is never changed.
// 3) complete: the app checks the size, reads the first bytes to learn the real type, and only then makes it visible.
app.post('/api/uploads', requireAuth, express.json({ limit: '4kb' }), wrap(async (req, res) => {
  const { name, size, taken_on } = req.body || {};
  if (!Number.isInteger(size) || size <= 0) return res.status(400).json({ error: 'Empty file' });
  if (size > MAX_UPLOAD) return res.status(413).json({ error: `File too large (limit ${Math.round(MAX_UPLOAD / 1048576)} MB)` });
  const clean = path.basename(String(name || 'untitled')).replace(/[\u0000-\u001f]/g, '').slice(0, 200) || 'untitled';
  const id = rid(), key = rid(24), now = Date.now();
  db.prepare(`INSERT INTO media (id,user_id,kind,mime,original_name,size,storage_name,taken_on,status,created_at,updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, req.session.user_id, 'image', 'application/octet-stream', clean, size, key, isDate(taken_on) ? taken_on : '', 'pending', now, now);
  const target = await storage.uploadTarget(key, size, id);
  res.status(201).json({ id, url: target.url, headers: target.headers });
}));

const pendingOf = (req) => db.prepare("SELECT * FROM media WHERE id = ? AND user_id = ? AND status = 'pending'").get(req.params.id, req.session.user_id);

class SizeGuard extends Transform {
  constructor(max) { super(); this.max = max; this.size = 0; }
  _transform(chunk, _e, cb) {
    this.size += chunk.length;
    if (this.size > this.max) return cb(Object.assign(new Error('File larger than declared'), { status: 413 }));
    cb(null, chunk);
  }
}

// Only used with STORAGE=local: receives the raw bytes and writes them to disk.
app.put('/api/uploads/:id/data', requireAuth, wrap(async (req, res) => {
  if (storage.direct) return res.status(404).json({ error: 'Not found' });
  const row = pendingOf(req);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (Number(req.headers['content-length']) !== row.size) return res.status(400).json({ error: 'Size mismatch' });
  const dest = storage.localPath(row.storage_name), tmp = `${dest}.part`;
  try {
    await pipeline(req, new SizeGuard(row.size), fs.createWriteStream(tmp, { mode: 0o600, flags: 'w' }));
    await fs.promises.rename(tmp, dest);
  } catch (err) {
    fs.promises.unlink(tmp).catch(() => {});
    return res.status(err.status || 500).json({ error: err.status ? err.message : 'Upload failed' });
  }
  res.json({ ok: true });
}));

async function discard(row) {
  db.prepare('DELETE FROM media WHERE id = ?').run(row.id);
  await storage.remove(row.storage_name);
}

app.post('/api/uploads/:id/complete', requireAuth, wrap(async (req, res) => {
  const row = pendingOf(req);
  if (!row) {
    const done = ownMedia(req);
    return done ? res.json({ id: done.id, kind: done.kind }) : res.status(404).json({ error: 'Not found' });
  }
  const size = await storage.head(row.storage_name);
  if (size === null) return res.status(400).json({ error: 'The file did not arrive. Please try again.' });
  if (size !== row.size) { await discard(row); return res.status(400).json({ error: 'Incomplete upload' }); }
  const type = sniff(await storage.readHead(row.storage_name, 64));
  if (!type) { await discard(row); return res.status(415).json({ error: 'Unsupported file type (images and videos only)' }); }
  db.prepare("UPDATE media SET kind = ?, mime = ?, status = 'ready', updated_at = ? WHERE id = ?").run(type.kind, type.mime, Date.now(), row.id);
  res.json({ id: row.id, kind: type.kind });
}));

// Abandoned uploads (closed tab, lost connection) are cleaned up after a day.
async function purgePending() {
  const old = db.prepare("SELECT * FROM media WHERE status = 'pending' AND created_at < ?").all(Date.now() - 864e5);
  for (const row of old) await discard(row);
}

// ---------- media: serve the ORIGINAL bytes (login required) ----------
app.get('/api/media/:id/file', requireAuth, wrap(async (req, res) => {
  const m = ownMedia(req);
  if (!m) return res.status(404).end();
  const download = req.query.download === '1';
  const filename = (m.original_name || 'file').replace(/[\r\n"]/g, '_');

  // R2: after the login check, hand the browser a signed link that expires within the hour.
  const signed = await storage.getUrl(m.storage_name, { mime: m.mime, filename, download });
  if (signed) return res.redirect(302, signed);

  // Local disk: stream here, with Range support so videos can seek.
  const file = storage.localPath(m.storage_name);
  let st;
  try { st = await fs.promises.stat(file); } catch { return res.status(404).end(); }
  const etag = `"${m.storage_name.slice(0, 16)}-${st.size}"`;
  res.set({
    'Content-Type': m.mime,
    'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(filename)}`,
    'Cache-Control': 'private, no-cache',
    ETag: etag,
    'Accept-Ranges': 'bytes',
  });
  let start = 0, end = st.size - 1, status = 200;
  const range = req.headers.range;
  if (range) {
    const mt = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!mt || (mt[1] === '' && mt[2] === '')) return res.status(416).set('Content-Range', `bytes */${st.size}`).end();
    if (mt[1] === '') start = Math.max(0, st.size - Number(mt[2]));
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
}));

// ---------- misc ----------
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status && err.status < 500 ? err.status : 500;
  res.status(status).json({ error: status === 500 ? 'Server error' : 'Bad request' });
  if (status === 500) console.error(err);
});

purgeExpiredSessions();
purgePending().catch(() => {});
setInterval(() => { purgeExpiredSessions(); purgePending().catch(() => {}); }, 60 * 60 * 1000).unref();

app.listen(PORT, HOST, () => {
  console.log(`Memory Vault listening on http://${HOST}:${PORT} (storage: ${driver}${SECURE ? ', secure cookies' : ''})`);
  if (!db.prepare('SELECT 1 FROM users LIMIT 1').get()) console.log('No users yet. Create one with: npm run create-user -- <username>');
});
