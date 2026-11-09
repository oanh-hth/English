import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Response } from 'superagent';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createLocalStorage } from '../src/storage/localStorage';
import { createMemoryStorage, createTestContext } from '../test-support/context';
import { seedMany, seedMedia, seedSeries } from '../test-support/db';

function setup() {
  const storage = createMemoryStorage();
  const ctx = createTestContext({ storage });
  return { ...ctx, storage };
}

describe('2.4 GET /api/library', () => {
  it('needs a login', async () => {
    const { anonymous } = setup();
    expect((await anonymous().get('/api/library')).status).toBe(401);
  });

  it('returns the media and series of the signed-in user only', async () => {
    const { as, db, alice, bob } = setup();
    const mine = seedMany(db, alice, 2);
    seedMany(db, bob, 3);
    const seriesId = seedSeries(db, alice, mine, { title: 'Trip' });
    const res = await as(alice).get('/api/library');
    expect(res.status).toBe(200);
    expect(res.body.media.map((m: { id: string }) => m.id).sort()).toEqual([...mine].sort());
    expect(res.body.series).toHaveLength(1);
    expect(res.body.series[0]).toMatchObject({ id: seriesId, title: 'Trip', coverId: mine[0] });
    expect(JSON.stringify(res.body)).not.toContain('storageKey');
  });
});

const BYTES = Buffer.from(Array.from({ length: 5000 }, (_, i) => (i * 7) % 251));
const KEY = 'abcdef0123456789';
const binary = (res: Response, done: (err: Error | null, body: Buffer) => void) => {
  const chunks: Buffer[] = [];
  res.on('data', (c: Buffer) => chunks.push(c));
  res.on('end', () => done(null, Buffer.concat(chunks)));
};

let dir: string;
beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vault-files-')); });
afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

/** A context with local storage and one stored photo of alice's, written straight to disk. */
function withFile() {
  const ctx = createTestContext({ storage: createLocalStorage(dir) });
  fs.writeFileSync(path.join(dir, KEY), BYTES);
  const id = seedMedia(ctx.db, ctx.alice, { storageKey: KEY, size: BYTES.length });
  return { ...ctx, a: ctx.as(ctx.alice), id };
}

describe('2.4 GET /api/media/:id/file (local storage)', () => {
  it('returns the original bytes with the right headers', async () => {
    const { a, id } = withFile();
    const res = await a.get(`/api/media/${id}/file`).buffer(true).parse(binary);
    expect(res.status).toBe(200);
    expect(Buffer.compare(res.body, BYTES)).toBe(0);
    expect(res.headers['content-type']).toBe('image/jpeg');
    expect(res.headers['content-length']).toBe(String(BYTES.length));
    expect(res.headers['accept-ranges']).toBe('bytes');
    expect(res.headers['content-disposition']).toBe(`inline; filename*=UTF-8''${id}.jpg`);
  });

  it('asks the browser to save the file with ?download=1', async () => {
    const { a, id } = withFile();
    const res = await a.get(`/api/media/${id}/file?download=1`).buffer(true).parse(binary);
    expect(res.headers['content-disposition']).toBe(`attachment; filename*=UTF-8''${id}.jpg`);
  });

  it('serves a slice for Range requests', async () => {
    const { a, id } = withFile();
    const res = await a.get(`/api/media/${id}/file`).set('Range', 'bytes=100-199').buffer(true).parse(binary);
    expect(res.status).toBe(206);
    expect(res.headers['content-range']).toBe(`bytes 100-199/${BYTES.length}`);
    expect(res.headers['content-length']).toBe('100');
    expect(Buffer.compare(res.body, BYTES.subarray(100, 200))).toBe(0);
    const tail = await a.get(`/api/media/${id}/file`).set('Range', 'bytes=-50').buffer(true).parse(binary);
    expect(tail.status).toBe(206);
    expect(Buffer.compare(tail.body, BYTES.subarray(BYTES.length - 50))).toBe(0);
  });

  it('answers 416 for a range outside the file', async () => {
    const { a, id } = withFile();
    const res = await a.get(`/api/media/${id}/file`).set('Range', 'bytes=99999-');
    expect(res.status).toBe(416);
    expect(res.headers['content-range']).toBe(`bytes */${BYTES.length}`);
  });

  it('answers 404 for strangers, unknown ids and unfinished uploads, and 401 when signed out', async () => {
    const { a, id, as, bob, anonymous, db, alice } = withFile();
    expect((await as(bob).get(`/api/media/${id}/file`)).status).toBe(404);
    expect((await a.get('/api/media/nope/file')).status).toBe(404);
    const pending = seedMedia(db, alice, { status: 'pending', storageKey: 'pending-key-123' });
    expect((await a.get(`/api/media/${pending}/file`)).status).toBe(404);
    expect((await anonymous().get(`/api/media/${id}/file`)).status).toBe(401);
  });
});

describe('2.4 GET /api/media/:id/file (cloud-style storage)', () => {
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
