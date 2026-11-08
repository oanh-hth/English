// EXERCISE 7.1: security headers. Make `npm run ex -- 7.1` pass.
//
// Headers are instructions the server gives the browser about how careful to be with our pages. They cost nothing and
// stop whole classes of attack even if we make a mistake elsewhere. Until you do this exercise the middleware does nothing,
// so the rest of the app keeps working.
// Docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP  and  https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
import type { RequestHandler } from 'express';

export interface SecurityHeaderOptions {
  /** The origin of the storage service the browser talks to directly, such as "https://abc.r2.cloudflarestorage.com". */
  storageOrigin?: string;
  /** true when the site is served over HTTPS. */
  secure: boolean;
}

/**
 * Build the Content-Security-Policy: a list of rules about where the page may load things from.
 * Join these directives with "; " in this exact order:
 *   default-src 'none'                 nothing is allowed unless a rule below says so
 *   script-src 'self'                  scripts only from our own server (blocks injected <script> and inline handlers)
 *   style-src 'self'
 *   font-src 'self'
 *   img-src 'self' data: blob:         (+ " " + storageOrigin when given)
 *   media-src 'self' blob:             (+ " " + storageOrigin when given)
 *   connect-src 'self'                 (+ " " + storageOrigin when given): where fetch/XHR may talk to
 *   form-action 'self'
 *   base-uri 'none'
 *   frame-ancestors 'none'             nobody may put our site in an <iframe> (clickjacking)
 */
export function buildCsp(storageOrigin?: string): string {
  return '';
}

/**
 * Middleware that sets, on every response:
 *   Content-Security-Policy       buildCsp(storageOrigin)
 *   X-Content-Type-Options        nosniff                  (do not guess file types)
 *   X-Frame-Options               DENY
 *   Referrer-Policy               no-referrer              (do not tell other sites which page the link came from)
 *   Cross-Origin-Resource-Policy  same-origin
 *   Cross-Origin-Opener-Policy    same-origin
 *   X-Robots-Tag                  noindex, nofollow        (keep search engines out)
 *   Permissions-Policy            camera=(), microphone=(), geolocation=(), interest-cohort=()
 * and, only when options.secure is true:
 *   Strict-Transport-Security     max-age=31536000; includeSubDomains   (always use HTTPS from now on)
 * Then call next(). Use res.set({ ... }) to set several headers at once.
 */
export function securityHeaders(options: SecurityHeaderOptions): RequestHandler {
  return (_req, _res, next) => next();
}
