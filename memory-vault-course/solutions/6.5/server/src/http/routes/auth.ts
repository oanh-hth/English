// Given: login, logout and "who am I". Read it: it is exercises 2.1 to 2.4 working together.
import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { SESSION_TTL_MS, COOKIE_NAME, type Config } from '../../config';
import type { LoginLimiter } from '../../auth/loginLimiter';
import { hashPassword, verifyPassword } from '../../auth/password';
import type { SessionStore } from '../../auth/sessions';
import type { UserRepo } from '../../db/userRepo';
import { asyncHandler, HttpError } from '../errors';
import { parseCookies, requireAuth } from '../authMiddleware';

export interface AuthRouterDeps {
  users: UserRepo;
  sessions: SessionStore;
  limiter: LoginLimiter;
  config: Config;
}

// Checked when the username does not exist, so a wrong username takes as long as a wrong password.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword(randomBytes(16).toString('hex')));

export function authRouter({ users, sessions, limiter, config }: AuthRouterDeps): Router {
  const router = Router();

  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      const { username, password } = req.body ?? {};
      if (typeof username !== 'string' || typeof password !== 'string' || password.length > 256) throw new HttpError(400, 'Invalid request');

      const keys = [`ip:${req.ip}`, `user:${username.toLowerCase()}`];
      if (limiter.isLocked(keys)) throw new HttpError(429, 'Too many attempts. Try again in 15 minutes.');

      const user = users.findByUsername(username);
      const ok = await verifyPassword(password, user ? user.passwordHash : await getDummyHash());
      if (!user || !ok) {
        limiter.recordFailure(keys);
        throw new HttpError(401, 'Wrong username or password');
      }

      limiter.clear(keys);
      const { token } = sessions.create(user.id);
      res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'strict', secure: config.secure, maxAge: SESSION_TTL_MS, path: '/' });
      res.set('Cache-Control', 'no-store').json({ ok: true });
    }),
  );

  router.post('/logout', requireAuth(sessions, COOKIE_NAME), (req, res) => {
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
    if (token) sessions.destroy(token);
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
  });

  router.get('/me', (req, res) => {
    res.set('Cache-Control', 'no-store');
    const session = sessions.find(parseCookies(req.headers.cookie)[COOKIE_NAME]);
    const user = session ? users.findById(session.userId) : null;
    if (!session || !user) return void res.status(401).json({ error: 'Not signed in' });
    res.json({ username: user.username, csrf: session.csrf, maxUploadBytes: config.maxUploadBytes });
  });

  return router;
}
