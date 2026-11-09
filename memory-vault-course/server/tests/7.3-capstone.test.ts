// CAPSTONE (server). No new code to write: this runs the REAL app (real passwords, sessions, SQLite, files on disk)
// through a whole journey. If an earlier exercise has a subtle bug, this is where it shows up.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { LoginLimiter } from '../src/auth/loginLimiter';
import { hashPassword } from '../src/auth/password';
import { SessionStore } from '../src/auth/sessions';
import { realAuth } from '../src/auth/strategies';
import { openDb } from '../src/db/schema';
import { UserRepo } from '../src/db/userRepo';
import { createLocalStorage } from '../src/storage/localStorage';

let dir: string;
beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vault-capstone-')); });
afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

const png = (seed: number) => Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from(Array.from({ length: 3000 }, (_, i) => (i * seed) % 251))]);
const binary = (res: any, done: (err: Error | null, body: Buffer) => void) => {
  const chunks: Buffer[] = [];
  res.on('data', (c: Buffer) => chunks.push(c));
  res.on('end', () => done(null, Buffer.concat(chunks)));
};

async function boot() {
  const db = openDb(':memory:');
  const users = new UserRepo(db);
  users.create('alice', await hashPassword('correct horse battery'));
  users.create('bob', await hashPassword('another long passphrase'));
  const config = { port: 0, host: '127.0.0.1', dataDir: dir, secure: false, maxUploadBytes: 5 * 1024 * 1024 };
  const auth = realAuth({ users, sessions: new SessionStore(), limiter: new LoginLimiter(), config });
  const app = createApp({ config, db, storage: createLocalStorage(dir), auth });
  return app;
}

async function signIn(app: Awaited<ReturnType<typeof boot>>, username: string, password: string) {
  const agent = request.agent(app);
  const login = await agent.post('/api/login').send({ username, password });
  const me = login.status === 200 ? await agent.get('/api/me') : null;
  return { agent, login, csrf: (me?.body.csrf as string) ?? '' };
}

describe('7.3 capstone: access', () => {
  it('keeps strangers out', async () => {
    const app = await boot();
    expect((await request(app).get('/api/library')).status).toBe(401);
    expect((await request(app).get('/api/me')).status).toBe(401);
    expect((await request(app).get('/api/media/abc/file')).status).toBe(401);
  });

  it('gives the same answer for a wrong password and an unknown user', async () => {
    const app = await boot();
    const wrong = await request(app).post('/api/login').send({ username: 'alice', password: 'wrong password!' });
    const unknown = await request(app).post('/api/login').send({ username: 'nobody', password: 'wrong password!' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body).toEqual(unknown.body);
  });

  it('locks the account after five wrong passwords, even for the right password', async () => {
    const app = await boot();
    for (let i = 0; i < 5; i++) await request(app).post('/api/login').send({ username: 'alice', password: `wrong password ${i}` });
    const locked = await request(app).post('/api/login').send({ username: 'alice', password: 'correct horse battery' });
    expect(locked.status).toBe(429);
  });

  it('sets a protected session cookie and the security headers', async () => {
    const app = await boot();
    const { login } = await signIn(app, 'alice', 'correct horse battery');
    expect(login.status).toBe(200);
    const cookie = String(login.headers['set-cookie']);
    expect(cookie).toMatch(/vault_sid=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
    expect(login.headers['content-security-policy']).toContain("default-src 'none'");
    expect(login.headers['x-frame-options']).toBe('DENY');
  });
});

describe('7.3 capstone: a whole journey', () => {
  it('uploads three photos, makes a series, edits it, downloads and signs out', async () => {
    const app = await boot();
    const { agent, csrf } = await signIn(app, 'alice', 'correct horse battery');
    expect((await agent.get('/api/me')).body.username).toBe('alice');

    // upload three photos (announce, send, finish)
    const photos = [png(3), png(5), png(7)];
    const ids: string[] = [];
    for (const [i, bytes] of photos.entries()) {
      const init = await agent.post('/api/uploads').set('X-CSRF-Token', csrf).send({ name: `trip-${i}.png`, size: bytes.length, takenOn: '2023-11-02' });
      expect(init.status).toBe(201);
      const put = await agent.put(init.body.url).set('X-CSRF-Token', csrf).set('Content-Type', 'application/octet-stream').send(bytes);
      expect(put.status).toBe(200);
      const done = await agent.post(`/api/uploads/${init.body.id}/complete`).set('X-CSRF-Token', csrf);
      expect(done.body.kind).toBe('image');
      ids.push(init.body.id);
    }

    // make them a series, in a chosen order
    const order = [ids[2], ids[0], ids[1]];
    const created = await agent.post('/api/series').set('X-CSRF-Token', csrf).send({ title: 'Hanoi trip', takenOn: '2023-11-02', ids: order });
    expect(created.status).toBe(201);
    const sid = created.body.id as string;

    let library = (await agent.get('/api/library')).body;
    expect(library.series).toHaveLength(1);
    expect(library.series[0]).toMatchObject({ id: sid, title: 'Hanoi trip', coverId: order[0] });
    const inSeries = library.media.filter((m: any) => m.seriesId === sid).sort((a: any, b: any) => a.position - b.position).map((m: any) => m.id);
    expect(inSeries).toEqual(order);

    // write a shared note, change the cover, reorder
    await agent.patch(`/api/series/${sid}`).set('X-CSRF-Token', csrf).send({ note: 'Six days, one backpack.', coverId: ids[1], ids: [ids[0], ids[1], ids[2]] });
    library = (await agent.get('/api/library')).body;
    expect(library.series[0]).toMatchObject({ note: 'Six days, one backpack.', coverId: ids[1] });

    // download the original, byte for byte, and a slice of it
    const file = await agent.get(`/api/media/${ids[1]}/file`).buffer(true).parse(binary);
    expect(Buffer.compare(file.body, photos[1])).toBe(0);
    const slice = await agent.get(`/api/media/${ids[1]}/file`).set('Range', 'bytes=10-19').buffer(true).parse(binary);
    expect(slice.status).toBe(206);
    expect(Buffer.compare(slice.body, photos[1].subarray(10, 20))).toBe(0);

    // remove one photo from the series, delete another
    await agent.patch(`/api/series/${sid}`).set('X-CSRF-Token', csrf).send({ ids: [ids[0], ids[1]] });
    await agent.delete(`/api/media/${ids[0]}`).set('X-CSRF-Token', csrf);
    library = (await agent.get('/api/library')).body;
    expect(library.media.map((m: any) => m.id).sort()).toEqual([ids[1], ids[2]].sort());
    expect(library.series).toHaveLength(1); // ids[1] is still in it
    expect(library.series[0].coverId).toBe(ids[1]);
    expect(fs.readdirSync(dir)).toHaveLength(2); // the deleted file is really gone

    // sign out: the cookie stops working
    expect((await agent.post('/api/logout').set('X-CSRF-Token', csrf)).status).toBe(200);
    expect((await agent.get('/api/library')).status).toBe(401);
  });

  it('keeps two users completely apart', async () => {
    const app = await boot();
    const alice = await signIn(app, 'alice', 'correct horse battery');
    const bob = await signIn(app, 'bob', 'another long passphrase');
    const bytes = png(3);
    const init = await alice.agent.post('/api/uploads').set('X-CSRF-Token', alice.csrf).send({ name: 'a.png', size: bytes.length });
    await alice.agent.put(init.body.url).set('X-CSRF-Token', alice.csrf).set('Content-Type', 'application/octet-stream').send(bytes);
    await alice.agent.post(`/api/uploads/${init.body.id}/complete`).set('X-CSRF-Token', alice.csrf);

    expect((await alice.agent.get('/api/library')).body.media).toHaveLength(1);
    expect((await bob.agent.get('/api/library')).body.media).toHaveLength(0);
    expect((await bob.agent.get(`/api/media/${init.body.id}/file`)).status).toBe(404);
    expect((await bob.agent.delete(`/api/media/${init.body.id}`).set('X-CSRF-Token', bob.csrf)).status).toBe(404);
  });

  it('refuses a disguised file and leaves nothing behind', async () => {
    const app = await boot();
    const { agent, csrf } = await signIn(app, 'alice', 'correct horse battery');
    const html = Buffer.from('<script>alert(1)</script>'.repeat(10));
    const init = await agent.post('/api/uploads').set('X-CSRF-Token', csrf).send({ name: 'photo.png', size: html.length });
    await agent.put(init.body.url).set('X-CSRF-Token', csrf).set('Content-Type', 'application/octet-stream').send(html);
    expect((await agent.post(`/api/uploads/${init.body.id}/complete`).set('X-CSRF-Token', csrf)).status).toBe(415);
    expect((await agent.get('/api/library')).body.media).toEqual([]);
    expect(fs.readdirSync(dir)).toEqual([]);
  });
});
