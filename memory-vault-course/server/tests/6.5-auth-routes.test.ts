import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { LoginLimiter } from '../src/auth/loginLimiter';
import { hashPassword } from '../src/auth/password';
import { SessionStore } from '../src/auth/sessions';
import { realAuth } from '../src/auth/strategies';
import { openDb } from '../src/db/schema';
import { UserRepo } from '../src/db/userRepo';
import { createMemoryStorage } from '../test-support/memoryStorage';

async function boot() {
  const db = openDb(':memory:');
  const users = new UserRepo(db);
  users.create('alice', await hashPassword('correct horse battery'));
  const config = { port: 0, host: '127.0.0.1', dataDir: '', secure: false, maxUploadBytes: 5 * 1024 * 1024 };
  return createApp({ config, db, storage: createMemoryStorage(), auth: realAuth({ users, sessions: new SessionStore(), limiter: new LoginLimiter(), config }) });
}
const login = (app: Awaited<ReturnType<typeof boot>>, username: string, password: string) => request(app).post('/api/login').send({ username, password });

describe('6.5 POST /api/login', () => {
  it('signs in with the right password and sets a protected cookie', async () => {
    const res = await login(await boot(), 'alice', 'correct horse battery');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(res.headers['cache-control']).toBe('no-store');
    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toMatch(/^vault_sid=[A-Za-z0-9_-]{43};/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
    expect(cookie).toMatch(/Path=\//);
    expect(cookie).not.toMatch(/Secure/i); // secure is false in this config
  });

  it('gives the same answer for a wrong password and an unknown user', async () => {
    const app = await boot();
    const wrong = await login(app, 'alice', 'not the password');
    const unknown = await login(app, 'nobody', 'not the password');
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body).toEqual({ error: 'Wrong username or password' });
    expect(unknown.body).toEqual(wrong.body);
    expect(wrong.headers['set-cookie']).toBeUndefined();
  });

  it('rejects a malformed body with 400', async () => {
    const app = await boot();
    expect((await request(app).post('/api/login').send({ username: 'alice' })).status).toBe(400);
    expect((await request(app).post('/api/login').send({ username: 5, password: 'x' })).status).toBe(400);
    expect((await login(app, 'alice', 'x'.repeat(300))).status).toBe(400);
  });

  it('locks out after five wrong passwords, even for the right one', async () => {
    const app = await boot();
    for (let i = 0; i < 5; i++) expect((await login(app, 'alice', `wrong ${i}`)).status).toBe(401);
    const locked = await login(app, 'alice', 'correct horse battery');
    expect(locked.status).toBe(429);
    expect(locked.body).toEqual({ error: 'Too many attempts. Try again in 15 minutes.' });
  });

  it('forgets earlier failures after a successful login', async () => {
    const app = await boot();
    for (let i = 0; i < 4; i++) await login(app, 'alice', `wrong ${i}`);
    expect((await login(app, 'alice', 'correct horse battery')).status).toBe(200);
    for (let i = 0; i < 4; i++) expect((await login(app, 'alice', `again ${i}`)).status).toBe(401);
  });
});

describe('6.5 GET /api/me and POST /api/logout', () => {
  it('says 401 to a stranger', async () => {
    const res = await request(await boot()).get('/api/me');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Not signed in' });
  });

  it('tells a signed-in user who they are, with the CSRF token', async () => {
    const agent = request.agent(await boot());
    await agent.post('/api/login').send({ username: 'alice', password: 'correct horse battery' });
    const me = await agent.get('/api/me');
    expect(me.status).toBe(200);
    expect(me.headers['cache-control']).toBe('no-store');
    expect(me.body).toMatchObject({ username: 'alice', maxUploadBytes: 5 * 1024 * 1024 });
    expect(me.body.csrf).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });

  it('logout needs a login and the CSRF token, then ends the session', async () => {
    const agent = request.agent(await boot());
    expect((await agent.post('/api/logout')).status).toBe(401);
    await agent.post('/api/login').send({ username: 'alice', password: 'correct horse battery' });
    const { csrf } = (await agent.get('/api/me')).body;
    expect((await agent.post('/api/logout')).status).toBe(403); // no CSRF token
    const out = await agent.post('/api/logout').set('X-CSRF-Token', csrf);
    expect(out.status).toBe(200);
    expect(out.body).toEqual({ ok: true });
    expect(String(out.headers['set-cookie'])).toMatch(/vault_sid=;/);
    expect((await agent.get('/api/me')).status).toBe(401);
  });
});
