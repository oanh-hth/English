import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Response } from 'superagent';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { uploadInitSchema, parseBody } from '../src/http/validation';
import { createLocalStorage } from '../src/storage/localStorage';
import { createMemoryStorage, createTestContext, type Agent } from '../test-support/context';

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

describe('4.3 uploading', () => {
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

const ok = (schema: { safeParse(v: unknown): { success: boolean } }, value: unknown) => schema.safeParse(value).success;

describe('4.3 uploadInitSchema', () => {
  it('needs a name and a positive whole size', () => {
    expect(ok(uploadInitSchema, { name: 'a.jpg', size: 10 })).toBe(true);
    expect(ok(uploadInitSchema, { name: 'a.jpg', size: 10, takenOn: '2024-01-01' })).toBe(true);
    expect(ok(uploadInitSchema, { name: '', size: 10 })).toBe(false);
    expect(ok(uploadInitSchema, { name: 'a.jpg', size: 0 })).toBe(false);
    expect(ok(uploadInitSchema, { name: 'a.jpg', size: -3 })).toBe(false);
    expect(ok(uploadInitSchema, { name: 'a.jpg', size: 1.5 })).toBe(false);
    expect(ok(uploadInitSchema, { name: 'a.jpg', size: '10' })).toBe(false);
    expect(ok(uploadInitSchema, { size: 10 })).toBe(false);
    expect(ok(uploadInitSchema, { name: 'x'.repeat(501), size: 10 })).toBe(false);
  });
});

