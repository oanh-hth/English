import { describe, expect, it } from 'vitest';
import { MediaRepo } from '../src/db/mediaRepo';
import { HttpError } from '../src/http/errors';
import { UploadService } from '../src/uploads/uploadService';
import { createMemoryStorage } from '../test-support/memoryStorage';
import { testDb } from '../test-support/db';

const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array(100).fill(7)]);
const MP4 = Uint8Array.from([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, ...new Array(100).fill(1)]);
const HTML = new TextEncoder().encode('<script>alert(1)</script>'.repeat(5));

function setup(maxBytes = 1_000_000) {
  const t = testDb();
  const media = new MediaRepo(t.db);
  const storage = createMemoryStorage();
  return { ...t, media, storage, service: new UploadService({ media, storage, maxBytes }) };
}
async function expectHttp(promise: Promise<unknown>, status: number) {
  const error = await promise.then(() => null, (e: unknown) => e);
  expect(error).toBeInstanceOf(HttpError);
  expect((error as HttpError).status).toBe(status);
  return error as HttpError;
}
/** Run init and "upload" the bytes straight into the fake storage. */
async function start(ctx: ReturnType<typeof setup>, userId: number, bytes: Uint8Array, name = 'a.png') {
  const init = await ctx.service.init(userId, { name, size: bytes.length });
  const row = ctx.media.findPending(init.id, userId)!;
  ctx.storage.put(row.storageKey, bytes);
  return { ...init, row };
}

describe('4.2 UploadService.init', () => {
  it('records a pending item and returns the storage target', async () => {
    const ctx = setup();
    const init = await ctx.service.init(ctx.alice, { name: 'beach.jpg', size: 500, takenOn: '2024-07-04' });
    expect(init.id).toMatch(/^[0-9a-f]{24}$/);
    expect(init.url).toMatch(/^memory:\/\/upload\/[0-9a-f]{48}$/);
    expect(init.headers).toEqual({ 'Content-Type': 'application/octet-stream' });
    const row = ctx.media.findPending(init.id, ctx.alice);
    expect(row).toMatchObject({ originalName: 'beach.jpg', size: 500, takenOn: '2024-07-04', status: 'pending' });
    expect(row?.storageKey).toMatch(/^[0-9a-f]{48}$/);
    expect(init.url.endsWith(row!.storageKey)).toBe(true);
  });

  it('cleans the file name and ignores a bad date', async () => {
    const ctx = setup();
    const init = await ctx.service.init(ctx.alice, { name: '../../etc/passwd', size: 5, takenOn: 'yesterday' });
    expect(ctx.media.findPending(init.id, ctx.alice)).toMatchObject({ originalName: 'passwd', takenOn: '' });
  });

  it('rejects empty and non-whole sizes with 400', async () => {
    const ctx = setup();
    for (const size of [0, -1, 1.5, NaN]) await expectHttp(ctx.service.init(ctx.alice, { name: 'a', size }), 400);
  });

  it('rejects files over the limit with 413', async () => {
    const ctx = setup(1000);
    await expectHttp(ctx.service.init(ctx.alice, { name: 'a', size: 1001 }), 413);
    await expect(ctx.service.init(ctx.alice, { name: 'a', size: 1000 })).resolves.toBeTruthy();
  });
});

describe('4.2 UploadService.complete', () => {
  it('turns a good upload into a ready photo', async () => {
    const ctx = setup();
    const { id } = await start(ctx, ctx.alice, PNG);
    expect(await ctx.service.complete(ctx.alice, id)).toEqual({ id, kind: 'image' });
    expect(ctx.media.findReady(id, ctx.alice)).toMatchObject({ kind: 'image', mime: 'image/png', status: 'ready' });
  });

  it('recognises videos', async () => {
    const ctx = setup();
    const { id } = await start(ctx, ctx.alice, MP4, 'clip.mp4');
    expect(await ctx.service.complete(ctx.alice, id)).toEqual({ id, kind: 'video' });
    expect(ctx.media.findReady(id, ctx.alice)?.mime).toBe('video/mp4');
  });

  it('can be called twice', async () => {
    const ctx = setup();
    const { id } = await start(ctx, ctx.alice, PNG);
    await ctx.service.complete(ctx.alice, id);
    expect(await ctx.service.complete(ctx.alice, id)).toEqual({ id, kind: 'image' });
  });

  it('answers 400 and keeps the pending item when the file never arrived', async () => {
    const ctx = setup();
    const init = await ctx.service.init(ctx.alice, { name: 'a.png', size: 100 });
    await expectHttp(ctx.service.complete(ctx.alice, init.id), 400);
    expect(ctx.media.findPending(init.id, ctx.alice)).not.toBeNull(); // the browser may retry
  });

  it('deletes the file and the item when the size is wrong', async () => {
    const ctx = setup();
    const init = await ctx.service.init(ctx.alice, { name: 'a.png', size: PNG.length + 50 });
    const key = ctx.media.findPending(init.id, ctx.alice)!.storageKey;
    ctx.storage.put(key, PNG);
    const error = await expectHttp(ctx.service.complete(ctx.alice, init.id), 400);
    expect(error.message).toBe('Incomplete upload');
    expect(ctx.storage.has(key)).toBe(false);
    expect(ctx.media.findPending(init.id, ctx.alice)).toBeNull();
  });

  it('deletes the file and the item when it is not an image or video (415)', async () => {
    const ctx = setup();
    const { id, row } = await start(ctx, ctx.alice, HTML, 'photo.png');
    await expectHttp(ctx.service.complete(ctx.alice, id), 415);
    expect(ctx.storage.has(row.storageKey)).toBe(false);
    expect(ctx.media.findPending(id, ctx.alice)).toBeNull();
    expect(ctx.media.listReady(ctx.alice)).toEqual([]);
  });

  it('answers 404 for unknown uploads and for someone else\'s', async () => {
    const ctx = setup();
    const { id } = await start(ctx, ctx.alice, PNG);
    await expectHttp(ctx.service.complete(ctx.alice, 'nope'), 404);
    await expectHttp(ctx.service.complete(ctx.bob, id), 404);
  });
});

describe('4.2 UploadService.purgeStale', () => {
  it('removes old pending uploads with their files and keeps fresh ones', async () => {
    const ctx = setup();
    const old = await start(ctx, ctx.alice, PNG);
    const now = Date.now();
    // Pretend a day has passed since the first upload, then start a fresh one.
    const future = now + 25 * 60 * 60 * 1000;
    const removed = await ctx.service.purgeStale(24 * 60 * 60 * 1000, future);
    expect(removed).toBe(1);
    expect(ctx.storage.has(old.row.storageKey)).toBe(false);
    expect(ctx.media.findPending(old.id, ctx.alice)).toBeNull();

    const fresh = await start(ctx, ctx.alice, PNG);
    expect(await ctx.service.purgeStale(24 * 60 * 60 * 1000, Date.now())).toBe(0);
    expect(ctx.media.findPending(fresh.id, ctx.alice)).not.toBeNull();
  });
});
