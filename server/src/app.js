// The Express app. createApp(db, config) so tests can pass an in-memory database and never open a port.
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }

const Credentials = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_.-]{3,30}$/, 'Use 3 to 30 letters, numbers, dots, dashes or underscores'),
  password: z.string().min(10, 'Use at least 10 characters').max(200),
});
// The server does not interpret the data, it only keeps it. Check the outline and the size.
const State = z.looseObject({ items: z.array(z.looseObject({ id: z.string().max(40), text: z.string().max(300) })).max(5000) });
const Put = z.object({ baseRev: z.number().int().min(0), data: State });

export function createApp(db, config) {
  const app = express();
  if (config.trustProxy) app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins.includes('*') ? true : config.corsOrigins, maxAge: 600 }));
  app.use(express.json({ limit: '2mb' }));
  const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: config.authLimit ?? 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts. Try again in a few minutes.' } });
  const apiLimit = rateLimit({ windowMs: 60 * 1000, limit: config.apiLimit ?? 120, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Slow down.' } });

  const sign = id => jwt.sign({ sub: String(id) }, config.jwtSecret, { expiresIn: '90d' });
  const auth = (req, _res, next) => {
    const h = req.get('authorization') || '';
    if (!h.startsWith('Bearer ')) throw new HttpError(401, 'Login required');
    try { req.userId = Number(jwt.verify(h.slice(7), config.jwtSecret).sub); } catch { throw new HttpError(401, 'Your login has expired. Log in again.'); }
    next();
  };

  app.get('/api/health', (_req, res) => { res.json({ ok: true }); });

  app.post('/api/users', authLimit, async (req, res) => {
    const { username, password } = Credentials.parse(req.body);
    const hash = await bcrypt.hash(password, 11);
    const r = await db.query('INSERT INTO users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING RETURNING id', [username, hash]);
    if (!r.rows.length) throw new HttpError(409, 'That username is taken');
    res.status(201).json({ username, token: sign(r.rows[0].id) });
  });

  // One answer for a wrong password and an unknown user, and always one hash comparison.
  const DUMMY = bcrypt.hashSync('not-a-real-password', 11);
  app.post('/api/login', authLimit, async (req, res) => {
    const parsed = Credentials.safeParse(req.body);
    if (!parsed.success) throw new HttpError(401, 'Wrong username or password');
    const r = await db.query('SELECT id, password_hash FROM users WHERE username = $1', [parsed.data.username]);
    const ok = await bcrypt.compare(parsed.data.password, r.rows[0]?.password_hash ?? DUMMY);
    if (!ok || !r.rows.length) throw new HttpError(401, 'Wrong username or password');
    res.json({ username: parsed.data.username, token: sign(r.rows[0].id) });
  });

  app.get('/api/state', apiLimit, auth, async (req, res) => {
    const r = await db.query('SELECT rev, data FROM states WHERE user_id = $1', [req.userId]);
    res.json(r.rows.length ? { rev: r.rows[0].rev, data: r.rows[0].data } : { rev: 0, data: null });
  });

  // Optimistic concurrency: you must say which revision you built on. If someone saved in between you get 409 and merge again.
  app.put('/api/state', apiLimit, auth, async (req, res) => {
    const { baseRev, data } = Put.parse(req.body);
    const json = JSON.stringify(data);
    const r = baseRev === 0
      ? await db.query('INSERT INTO states (user_id, rev, data) VALUES ($1, 1, $2::jsonb) ON CONFLICT (user_id) DO NOTHING RETURNING rev', [req.userId, json])
      : await db.query('UPDATE states SET data = $2::jsonb, rev = rev + 1, updated_at = now() WHERE user_id = $1 AND rev = $3 RETURNING rev', [req.userId, json, baseRev]);
    if (!r.rows.length) {
      const user = await db.query('SELECT 1 FROM users WHERE id = $1', [req.userId]);
      if (!user.rows.length) throw new HttpError(401, 'This account no longer exists');
      throw new HttpError(409, 'Your data changed on another device');
    }
    res.json({ rev: r.rows[0].rev });
  });

  app.delete('/api/me', authLimit, auth, async (req, res) => {
    const password = z.object({ password: z.string().max(200) }).parse(req.body).password;
    const r = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
    if (!r.rows.length || !(await bcrypt.compare(password, r.rows[0].password_hash))) throw new HttpError(403, 'Wrong password');
    await db.query('DELETE FROM users WHERE id = $1', [req.userId]);   // the state row goes with it (ON DELETE CASCADE)
    res.status(204).end();
  });

  app.use('/api', (_req, _res) => { throw new HttpError(404, 'Not found'); });
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues[0]?.message || 'Invalid input' });
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'That is too much data to sync' });
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  });
  return app;
}
