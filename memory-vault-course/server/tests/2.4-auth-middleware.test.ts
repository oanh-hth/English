import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { SessionStore } from '../src/auth/sessions';
import { parseCookies, requireAuth, safeEqual } from '../src/http/authMiddleware';

describe('2.4 parseCookies', () => {
  it('parses several cookies', () => {
    expect(parseCookies('a=1; b=hello')).toEqual({ a: '1', b: 'hello' });
  });
  it('returns {} when there is no header', () => {
    expect(parseCookies(undefined)).toEqual({});
    expect(parseCookies('')).toEqual({});
  });
  it('decodes values and keeps equals signs inside them', () => {
    expect(parseCookies('n=hello%20world; t=a=b')).toEqual({ n: 'hello world', t: 'a=b' });
  });
  it('skips broken pairs instead of throwing', () => {
    expect(parseCookies('bad=%E0%A4%A; ok=1; nothing')).toEqual({ ok: '1' });
  });
});

describe('2.4 safeEqual', () => {
  it('compares strings', () => {
    expect(safeEqual('secret', 'secret')).toBe(true);
    expect(safeEqual('secret', 'secreT')).toBe(false);
    expect(safeEqual('short', 'longer text')).toBe(false);
    expect(safeEqual('', '')).toBe(true);
  });
});

function makeApp() {
  const sessions = new SessionStore();
  const app = express();
  app.use(requireAuth(sessions, 'sid'));
  app.get('/who', (req, res) => res.json({ userId: req.session?.userId }));
  app.post('/change', (_req, res) => res.json({ ok: true }));
  const { token, session } = sessions.create(7);
  return { app, token, csrf: session.csrf };
}

describe('2.4 requireAuth', () => {
  it('answers 401 without a session cookie', async () => {
    const { app } = makeApp();
    const res = await request(app).get('/who');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Not signed in' });
  });

  it('answers 401 for an unknown token', async () => {
    const { app } = makeApp();
    expect((await request(app).get('/who').set('Cookie', 'sid=wrong')).status).toBe(401);
  });

  it('lets a signed-in GET through, sets req.session and Cache-Control: no-store', async () => {
    const { app, token } = makeApp();
    const res = await request(app).get('/who').set('Cookie', `sid=${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: 7 });
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('blocks a change without the CSRF token', async () => {
    const { app, token } = makeApp();
    const res = await request(app).post('/change').set('Cookie', `sid=${token}`);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'Bad CSRF token' });
  });

  it('blocks a change with the wrong CSRF token', async () => {
    const { app, token } = makeApp();
    const res = await request(app).post('/change').set('Cookie', `sid=${token}`).set('X-CSRF-Token', 'nope');
    expect(res.status).toBe(403);
  });

  it('allows a change with the right CSRF token', async () => {
    const { app, token, csrf } = makeApp();
    const res = await request(app).post('/change').set('Cookie', `sid=${token}`).set('X-CSRF-Token', csrf);
    expect(res.status).toBe(200);
  });

  it('blocks a change that comes from another website (Origin check)', async () => {
    const { app, token, csrf } = makeApp();
    const res = await request(app)
      .post('/change')
      .set('Cookie', `sid=${token}`)
      .set('X-CSRF-Token', csrf)
      .set('Host', 'vault.example.com')
      .set('Origin', 'https://evil.example.net');
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'Bad origin' });
  });

  it('accepts a matching Origin and rejects one that is not a URL', async () => {
    const { app, token, csrf } = makeApp();
    const base = () => request(app).post('/change').set('Cookie', `sid=${token}`).set('X-CSRF-Token', csrf).set('Host', 'vault.example.com');
    expect((await base().set('Origin', 'https://vault.example.com')).status).toBe(200);
    expect((await base().set('Origin', 'null')).status).toBe(403);
  });

  it('does not require the CSRF token for GET', async () => {
    const { app, token } = makeApp();
    expect((await request(app).get('/who').set('Cookie', `sid=${token}`)).status).toBe(200);
  });
});
