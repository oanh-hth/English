// Given: "who is allowed in?" as a swappable part (a strategy).
//
//   devAuth   everybody is the same pre-made user, with no password. Used in the first parts, so you can build and see
//             the app before sign-in exists.
//   realAuth  your sign-in from part 6: passwords, sessions, cookies, CSRF.
//
// createApp() only knows the AuthStrategy shape, so switching is one line in main.ts (see AUTH=real).
import type { RequestHandler, Router } from 'express';
import { Router as makeRouter } from 'express';
import type { Config } from '../config';
import { COOKIE_NAME } from '../config';
import { requireAuth } from '../http/authMiddleware';
import { authRouter, type AuthRouterDeps } from '../http/routes/auth';

export interface AuthStrategy {
  /** Public routes: /me, /login, /logout. */
  router: Router;
  /** Runs before every private route and sets req.session, or answers 401. */
  middleware: RequestHandler;
}

export function devAuth(user: { id: number; username: string }, config: Pick<Config, 'maxUploadBytes'>): AuthStrategy {
  const router = makeRouter();
  router.get('/me', (_req, res) => void res.json({ username: user.username, csrf: 'dev', maxUploadBytes: config.maxUploadBytes }));
  router.post('/login', (_req, res) => void res.json({ ok: true }));
  router.post('/logout', (_req, res) => void res.json({ ok: true }));
  return {
    router,
    middleware: (req, _res, next) => {
      req.session = { userId: user.id, csrf: 'dev', expiresAt: Number.MAX_SAFE_INTEGER };
      next();
    },
  };
}

export function realAuth(deps: AuthRouterDeps): AuthStrategy {
  return { router: authRouter(deps), middleware: requireAuth(deps.sessions, COOKIE_NAME) };
}
