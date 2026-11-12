// EXERCISE 6.5: the sign-in routes. Make `npm run ex -- 6.5` pass.
//
// Everything from this part comes together here: your password hashing (6.1), sessions (6.2), lockout (6.3) and the
// auth middleware (6.4) become three routes the login form can call.
//
//   POST /login   body { username, password }  ->  sets the session cookie
//   POST /logout  (signed-in users only)       ->  forgets the session
//   GET  /me      who am I? (public: answers 401 when nobody is signed in)
import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import type { Config } from '../../config';
import { COOKIE_NAME, SESSION_TTL_MS } from '../../config';
import type { LoginLimiter } from '../../auth/loginLimiter';
import { hashPassword, verifyPassword } from '../../auth/password';
import type { SessionStore } from '../../auth/sessions';
import type { UserRepo } from '../../db/userRepo';
import { parseCookies, requireAuth } from '../authMiddleware';
import { asyncHandler, HttpError } from '../errors';

export interface AuthRouterDeps {
  users: UserRepo;
  sessions: SessionStore;
  limiter: LoginLimiter;
  config: Config;
}

// Given: checked when the username does not exist, so a wrong username takes as long as a wrong password
// and an attacker cannot tell which usernames exist by measuring response time.
let dummyHash: Promise<string> | undefined;
export const getDummyHash = () => (dummyHash ??= hashPassword(randomBytes(16).toString('hex')));

/**
 * POST /login
 *   1. The body must be { username: string, password: string } with a password of at most 256 characters,
 *      otherwise throw new HttpError(400, 'Invalid request').
 *   2. keys = [`ip:${req.ip}`, `user:${username.toLowerCase()}`]. If limiter.isLocked(keys):
 *      throw new HttpError(429, 'Too many attempts. Try again in 15 minutes.')
 *   3. Find the user (users.findByUsername). verifyPassword(password, user ? user.passwordHash : await getDummyHash()).
 *      (Always verify against SOMETHING: see the comment on getDummyHash.)
 *   4. Wrong username or password: limiter.recordFailure(keys) and throw new HttpError(401, 'Wrong username or password').
 *      The message must be identical for an unknown user and a wrong password.
 *   5. Success: limiter.clear(keys); const { token } = sessions.create(user.id); then set the cookie
 *        res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'strict', secure: config.secure, maxAge: SESSION_TTL_MS, path: '/' })
 *      and respond { ok: true } with the header Cache-Control: no-store.
 *      (httpOnly: page scripts cannot read the cookie. sameSite strict: other sites cannot make the browser send it.)
 *
 * POST /logout   protected by requireAuth(sessions, COOKIE_NAME). Destroy the session of the cookie
 *                (parseCookies(req.headers.cookie)[COOKIE_NAME]), clear the cookie (res.clearCookie(COOKIE_NAME, { path: '/' })), respond { ok: true }.
 *
 * GET /me        Cache-Control: no-store. Find the session from the cookie and its user (users.findById). No session or no user:
 *                respond 401 { error: 'Not signed in' }. Otherwise respond { username, csrf: session.csrf, maxUploadBytes: config.maxUploadBytes }.
 */
export function authRouter(deps: AuthRouterDeps): Router {
  const router = Router();
  // TODO: add the three routes described above.
  return router;
}
