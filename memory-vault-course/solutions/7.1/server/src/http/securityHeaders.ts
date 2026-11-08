import type { RequestHandler } from 'express';

export interface SecurityHeaderOptions {
  storageOrigin?: string;
  secure: boolean;
}

export function buildCsp(storageOrigin?: string): string {
  const extra = storageOrigin ? ` ${storageOrigin}` : '';
  return [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "font-src 'self'",
    `img-src 'self' data: blob:${extra}`,
    `media-src 'self' blob:${extra}`,
    `connect-src 'self'${extra}`,
    "form-action 'self'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
}

export function securityHeaders({ storageOrigin, secure }: SecurityHeaderOptions): RequestHandler {
  const csp = buildCsp(storageOrigin);
  return (_req, res, next) => {
    res.set({
      'Content-Security-Policy': csp,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'X-Robots-Tag': 'noindex, nofollow',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    });
    if (secure) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  };
}
