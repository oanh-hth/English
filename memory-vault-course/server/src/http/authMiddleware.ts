// EXERCISE 2.4: the gatekeeper. Make `npm run ex -- 2.4` pass.
//
// Express "middleware" is a function that runs before your route: (req, res, next) => ...
// It can answer the request itself (res.status(401).json(...)) or call next() to let the request continue.
// requireAuth is put in front of every private route, so no route can forget to check the login.
import type { RequestHandler } from 'express';
import type { SessionStore } from '../auth/sessions';

/**
 * Turn the Cookie header ("a=1; b=hello%20world") into an object ({ a: '1', b: 'hello world' }).
 *  - header is undefined when the browser sent no cookies: return {}
 *  - values are URL-decoded (decodeURIComponent); skip a pair whose value cannot be decoded
 *  - ignore parts without an "="
 */
export function parseCookies(header: string | undefined): Record<string, string> {
  throw new Error('Not implemented: parseCookies');
}

/**
 * Compare two strings in constant time (crypto.timingSafeEqual needs two Buffers of the same length).
 * Return false when the lengths differ. Used for secrets such as the CSRF token.
 */
export function safeEqual(a: string, b: string): boolean {
  throw new Error('Not implemented: safeEqual');
}

/**
 * Build the middleware.
 *
 * 1. Read the cookie called `cookieName` and look up the session. No session -> respond 401 {"error":"Not signed in"}.
 * 2. Otherwise set `req.session` (TypeScript already knows about it) and the header "Cache-Control: no-store".
 * 3. For every request that is NOT a GET or HEAD (it changes something), also check:
 *      - CSRF origin: if the request has an Origin header, its host must equal the request's Host header,
 *        otherwise respond 403 {"error":"Bad origin"}. (An Origin that is not a valid URL, such as "null", is also bad.)
 *      - CSRF token: the "X-CSRF-Token" header must equal session.csrf (use safeEqual), otherwise 403 {"error":"Bad CSRF token"}.
 * 4. Call next().
 *
 * Why? A cookie is sent automatically, even when another website makes your browser send the request.
 * Requiring a secret that only our own page knows (the CSRF token) stops that.
 */
export function requireAuth(sessions: SessionStore, cookieName: string): RequestHandler {
  throw new Error('Not implemented: requireAuth');
}
