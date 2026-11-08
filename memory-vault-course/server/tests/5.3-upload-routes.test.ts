import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Response } from 'superagent';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createLocalStorage } from '../src/storage/localStorage';
import { createMemoryStorage, createTestContext, type Agent } from '../test-support/context';
import { seedMedia } from '../test-support/db';

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from(Array.from({ length: 5000 }, (_, i) => i % 251))]);
const HTML = Buffer.from('<script>alert(1)</script>'.repeat(10));

let dir: string;
beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vault-routes-')); });
afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

const binary = (res: Response, done: (err: Error | null, body: Buffer) => void) => {
  const chunks: Buffer[] = [];
  res.on('data', (c: Buffer) => chunks.push(c));
  res.on('end', () => done(null, Buffer.concat(chunks)));
};

function local() {
  return createTestContext({ storage: createLocalStorage(dir) });
}

/** The browser's three steps: announce, send the bytes, finish. */
async function upload(agent: Agent, bytes: Buffer, name = 'beach.png') {
  const init = await agent.post('/api/uploads').send({ name, size: bytes.length, takenOn: '2024-07-04' });
  expect(init.status).toBe(201);
  const put = await agent.put(init.body.url).set('Content-Type', 'application/octet-stream').send(bytes);
  const done = await agent.post(`/api/uploads/${init.body.id}/complete`);
  return { id: init.body.id as string, init, put, done };
}

describe('5.3 uploading', () => {
  it('needs a login', async () => {
    const { anonymous } = local();
    expect((await anonymous().post('/api/uploads').send({ name: 'a.png', size: 5 })).status).toBe(401);
  });

  it('runs the whole flow and makes the item visible', async () => {
    const ctx = local();
    const a = ctx.as(ctx.alice);
    const { id, init, put, done } = await upload(a, PNG);
    expect(init.body.url).toBe(`/api/uploads/${id}/data`);
    expect(put.status).toBe(200);
    expect(done.status).toBe(200);
    expect(done.body).toEqual({ id, kind: 'image' });
    const library = await a.get('/api/library');
    expect(library.body.media).toHaveLength(1);
    expect(library.body.media[0]).toMatchObject({ id, kind: 'image', mime: 'image/png', originalName: 'beach.png', takenOn: '2024-07-04', size: PNG.length });
  });

  it('refuses bad announcements', async () => {
    const ctx = local();
    const a = ctx.as(ctx.alice);
    expect((await a.post('/api/uploads').send({ name: 'a.png', size: 0 })).status).toBe(400);
    expect((await a.post('/api/uploads').send({ name: '', size: 5 })).status).toBe(400);
    const tooBig = await a.post('/api/uploads').send({ name: 'a.mp4', size: 10 * 1024 * 1024 });
    expect(tooBig.status).toBe(413);
  });

  it('rejects bytes that do not match the announced size', async () => {
    const ctx = local();
    const a = ctx.as(ctx.alice);
    const init = await a.post('/api/uploads').send({ name: 'a.png', size: 100 });
    const put = await a.put(init.body.url).set('Content-Type', 'application/octet-stream').send(PNG);
    expect(put.status).toBe(400);
    expect(put.body).toEqual({ error: 'Size mismatch' });
  });

  it('deletes an upload that is not really an image or video (415) and never shows it', async () => {
    const ctx = local();
    const a = ctx.as(ctx.alice);
    const { done } = await upload(a, HTML, 'photo.png');
    expect(done.status).toBe(415);
    expect((await a.get('/api/library')).body.media).toEqual([]);
    expect(fs.readdirSync(dir)).toEqual([]); // the file was removed too
  });

  it('does not let one user send bytes to another user\'s upload', async () => {
    const ctx = local();
    const init = await ctx.as(ctx.alice).post('/api/uploads').send({ name: 'a.png', size: PNG.length });
    const put = await ctx.as(ctx.bob).put(init.body.url).set('Content-Type', 'application/octet-stream').send(PNG);
    expect(put.status).toBe(404);
    expect((await ctx.as(ctx.bob).post(`/api/uploads/${init.body.id}/complete`)).status).toBe(404);
  });

  it('has no data route when the storage takes uploads directly', async () => {
    const ctx = createTestContext({ storage: createMemoryStorage() });
    const a = ctx.as(ctx.alice);
    const init = await a.post('/api/uploads').send({ name: 'a.png', size: 10 });
    expect(init.body.url).toMatch(/^memory:\/\/upload\//);
    expect((await a.put(`/api/uploads/${init.body.id}/data`).send(Buffer.alloc(10))).status).toBe(404);
  });
});

describe('5.3 GET /api/media/:id/file (local storage)', () => {
  async function stored() {
    const ctx = local();
    const a = ctx.as(ctx.alice);
    const { id } = await upload(a, PNG);
    return { ...ctx, a, id };
  }

  it('returns the original bytes with the right headers', async () => {
    const { a, id } = await stored();
    const res = await a.get(`/api/media/${id}/file`).buffer(true).parse(binary);
    expect(res.status).toBe(200);
    expect(Buffer.compare(res.body, PNG)).toBe(0);
    expect(res.headers['content-type']).toBe('image/png');
    expect(res.headers['content-length']).toBe(String(PNG.length));
    expect(res.headers['accept-ranges']).toBe('bytes');
    expect(res.headers['content-disposition']).toBe("inline; filename*=UTF-8''beach.png");
  });

  it('asks the browser to save the file with ?download=1', async () => {
    const { a, id } = await stored();
    const res = await a.get(`/api/media/${id}/file?download=1`).buffer(true).parse(binary);
    expect(res.headers['content-disposition']).toBe("attachment; filename*=UTF-8''beach.png");
  });

  it('serves a slice for Range requests', async () => {
    const { a, id } = await stored();
    const res = await a.get(`/api/media/${id}/file`).set('Range', 'bytes=100-199').buffer(true).parse(binary);
    expect(res.status).toBe(206);
    expect(res.headers['content-range']).toBe(`bytes 100-199/${PNG.length}`);
    expect(res.headers['content-length']).toBe('100');
    expect(Buffer.compare(res.body, PNG.subarray(100, 200))).toBe(0);
    const tail = await a.get(`/api/media/${id}/file`).set('Range', 'bytes=-50').buffer(true).parse(binary);
    expect(tail.status).toBe(206);
    expect(Buffer.compare(tail.body, PNG.subarray(PNG.length - 50))).toBe(0);
  });

  it('answers 416 for a range outside the file', async () => {
    const { a, id } = await stored();
    const res = await a.get(`/api/media/${id}/file`).set('Range', 'bytes=99999-');
    expect(res.status).toBe(416);
    expect(res.headers['content-range']).toBe(`bytes */${PNG.length}`);
  });

  it('answers 404 for strangers, unknown ids and unfinished uploads', async () => {
    const { a, id, as, bob, anonymous } = await stored();
    expect((await as(bob).get(`/api/media/${id}/file`)).status).toBe(404);
    expect((await a.get('/api/media/nope/file')).status).toBe(404);
    const pending = await a.post('/api/uploads').send({ name: 'x.png', size: 10 });
    expect((await a.get(`/api/media/${pending.body.id}/file`)).status).toBe(404);
    expect((await anonymous().get(`/api/media/${id}/file`)).status).toBe(401);
  });
});

describe('5.3 GET /api/media/:id/file (cloud-style storage)', () => {
  it('redirects to a temporary link after checking the login', async () => {
    const ctx = createTestContext({ storage: createMemoryStorage() });
    const id = seedMedia(ctx.db, ctx.alice, { storageKey: 'k-123456789' });
    const res = await ctx.as(ctx.alice).get(`/api/media/${id}/file?download=1`).redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^memory:\/\/view\/k-123456789\?/);
    const url = new URL(res.headers.location);
    expect(url.searchParams.get('download')).toBe('true');
    expect(url.searchParams.get('type')).toBe('image/jpeg');
    expect((await ctx.as(ctx.bob).get(`/api/media/${id}/file`).redirects(0)).status).toBe(404);
  });
});
