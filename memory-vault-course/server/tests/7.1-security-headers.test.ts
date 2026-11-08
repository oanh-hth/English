import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildCsp, securityHeaders } from '../src/http/securityHeaders';

describe('7.1 buildCsp', () => {
  it('lists the directives in order, all pointing at our own server', () => {
    expect(buildCsp()).toBe(
      "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    );
  });
  it('allows the storage origin for images, media and uploads, and nothing else', () => {
    const csp = buildCsp('https://abc.r2.cloudflarestorage.com');
    const rule = (name: string) => csp.split('; ').find((d) => d.startsWith(name))!;
    expect(rule('img-src')).toBe("img-src 'self' data: blob: https://abc.r2.cloudflarestorage.com");
    expect(rule('media-src')).toBe("media-src 'self' blob: https://abc.r2.cloudflarestorage.com");
    expect(rule('connect-src')).toBe("connect-src 'self' https://abc.r2.cloudflarestorage.com");
    expect(rule('script-src')).toBe("script-src 'self'");
    expect(csp.match(/r2\.cloudflarestorage/g)).toHaveLength(3);
  });
  it('never allows inline scripts', () => {
    expect(buildCsp('https://x.example')).not.toContain('unsafe-inline');
    expect(buildCsp('https://x.example')).not.toContain('unsafe-eval');
  });
});

describe('7.1 securityHeaders', () => {
  const appWith = (options: Parameters<typeof securityHeaders>[0]) => {
    const app = express();
    app.use(securityHeaders(options));
    app.get('/', (_req, res) => res.send('hello'));
    return app;
  };

  it('sets the protective headers and still lets the request through', async () => {
    const res = await request(appWith({ secure: false, storageOrigin: 'https://bucket.example' })).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('hello');
    expect(res.headers['content-security-policy']).toBe(buildCsp('https://bucket.example'));
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
    expect(res.headers['cross-origin-resource-policy']).toBe('same-origin');
    expect(res.headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(res.headers['x-robots-tag']).toBe('noindex, nofollow');
    expect(res.headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=(), interest-cohort=()');
  });

  it('adds HSTS only when the site is served over HTTPS', async () => {
    expect((await request(appWith({ secure: false })).get('/')).headers['strict-transport-security']).toBeUndefined();
    expect((await request(appWith({ secure: true })).get('/')).headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
  });
});
