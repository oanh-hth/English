import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import type { SessionStore } from '../auth/sessions';

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i <= 0) continue;
    try {
      out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    } catch {
      // a value that cannot be decoded is ignored
    }
  }
  return out;
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function sameHost(origin: string, host: string | undefined): boolean {
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function requireAuth(sessions: SessionStore, cookieName: string): RequestHandler {
  return (req, res, next) => {
    const session = sessions.find(parseCookies(req.headers.cookie)[cookieName]);
    if (!session) {
      res.status(401).json({ error: 'Not signed in' });
      return;
    }
    req.session = session;
    res.set('Cache-Control', 'no-store');

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const origin = req.headers.origin;
      if (origin && !sameHost(origin, req.headers.host)) {
        res.status(403).json({ error: 'Bad origin' });
        return;
      }
      const sent = req.headers['x-csrf-token'];
      if (typeof sent !== 'string' || !safeEqual(sent, session.csrf)) {
        res.status(403).json({ error: 'Bad CSRF token' });
        return;
      }
    }
    next();
  };
}
