// EXERCISE 7.1 lives here (security headers). Until you do it, this does nothing so the rest of the course works.
import type { RequestHandler } from 'express';

export interface SecurityHeaderOptions {
  /** The origin of the storage service the browser talks to directly, such as "https://abc.r2.cloudflarestorage.com". */
  storageOrigin?: string;
  /** true when the site is served over HTTPS. */
  secure: boolean;
}

export function buildCsp(storageOrigin?: string): string {
  return '';
}

export function securityHeaders(options: SecurityHeaderOptions): RequestHandler {
  return (_req, _res, next) => next();
}
