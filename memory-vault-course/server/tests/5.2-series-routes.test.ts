import { describe, expect, it } from 'vitest';
import { parseBody, seriesCreateSchema, seriesPatchSchema } from '../src/http/validation';
import { createMemoryStorage, createTestContext } from '../test-support/context';
import { placement, seedMany, seedMedia } from '../test-support/db';

function setup() {
  const storage = createMemoryStorage();
  const ctx = createTestContext({ storage });
  return { ...ctx, storage };
}

describe('5.2 deleting photos tidies series', () => {
  it('deleting the last photo of a series removes the series', async () => {
    const { as, db, alice, series } = setup();
    const [only] = seedMany(db, alice, 1);
    const sid = series.create(alice, {}, [only]);
    await as(alice).delete(`/api/media/${only}`);
    expect(series.get(sid, alice)).toBeNull();
  });
});

describe('5.2 POST /api/series', () => {
  it('creates a series in the given order', async () => {
    const { as, db, alice, series } = setup();
    const [a, b, c] = seedMany(db, alice, 3);
    const res = await as(alice).post('/api/series').send({ title: 'Hanoi trip', takenOn: '2023-11-02', ids: [c, a, b] });
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^[0-9a-f]{24}$/);
    expect(series.get(res.body.id, alice)).toMatchObject({ title: 'Hanoi trip', takenOn: '2023-11-02', coverId: c });
    expect(placement(db, [c, a, b]).map((p) => p.position)).toEqual([0, 1, 2]);
  });

  it('answers 400 for validation problems and for photos that are not yours', async () => {
    const { as, db, alice, bob } = setup();
    const theirs = seedMedia(db, bob);
    const mine = seedMedia(db, alice);
    expect((await as(alice).post('/api/series').send({ ids: [] })).body).toEqual({ error: 'Pick at least one photo' });
    const stolen = await as(alice).post('/api/series').send({ ids: [mine, theirs] });
    expect(stolen.status).toBe(400);
    expect(stolen.body).toEqual({ error: 'Pick existing photos or videos' });
  });
});

describe('5.2 PATCH /api/series/:id', () => {
  it('edits the shared note and reorders photos', async () => {
    const { as, db, alice, series } = setup();
    const [a, b] = seedMany(db, alice, 2);
    const id = series.create(alice, {}, [a, b]);
    const res = await as(alice).patch(`/api/series/${id}`).send({ note: 'Six days, one backpack.', ids: [b, a], coverId: b });
    expect(res.status).toBe(200);
    expect(series.get(id, alice)).toMatchObject({ note: 'Six days, one backpack.', coverId: b });
    expect(placement(db, [b, a]).map((p) => p.position)).toEqual([0, 1]);
  });

  it('dissolves the series when ids is empty', async () => {
    const { as, db, alice, series } = setup();
    const id = series.create(alice, {}, seedMany(db, alice, 2));
    expect((await as(alice).patch(`/api/series/${id}`).send({ ids: [] })).status).toBe(200);
    expect(series.get(id, alice)).toBeNull();
  });

  it('answers 404 for unknown or foreign series, and 400 for bad photo lists', async () => {
    const { as, db, alice, bob, series } = setup();
    const [a] = seedMany(db, alice, 1);
    const theirs = seedMedia(db, bob);
    const id = series.create(alice, { title: 'Keep' }, [a]);
    expect((await as(alice).patch('/api/series/nope').send({ title: 'x' })).status).toBe(404);
    expect((await as(bob).patch(`/api/series/${id}`).send({ title: 'hacked' })).status).toBe(404);
    const bad = await as(alice).patch(`/api/series/${id}`).send({ ids: [a, theirs] });
    expect(bad.status).toBe(400);
    expect(bad.body).toEqual({ error: 'Invalid photo list' });
    expect(series.get(id, alice)?.title).toBe('Keep');
  });
});

describe('5.2 DELETE /api/series/:id', () => {
  it('deletes the series, its photos and their files', async () => {
    const { as, db, alice, series, media, storage } = setup();
    const a = seedMedia(db, alice, { storageKey: 'file-a' });
    const b = seedMedia(db, alice, { storageKey: 'file-b' });
    const other = seedMedia(db, alice, { storageKey: 'file-other' });
    for (const k of ['file-a', 'file-b', 'file-other']) storage.put(k, new Uint8Array([1]));
    const id = series.create(alice, {}, [a, b]);
    expect((await as(alice).delete(`/api/series/${id}`)).status).toBe(200);
    expect(series.get(id, alice)).toBeNull();
    expect(media.findReady(a, alice)).toBeNull();
    expect(storage.keys()).toEqual(['file-other']);
    expect(media.findReady(other, alice)).not.toBeNull();
  });

  it('answers 404 for unknown or foreign series', async () => {
    const { as, db, alice, bob, series } = setup();
    const id = series.create(alice, {}, seedMany(db, alice, 1));
    expect((await as(alice).delete('/api/series/nope')).status).toBe(404);
    expect((await as(bob).delete(`/api/series/${id}`)).status).toBe(404);
    expect(series.get(id, alice)).not.toBeNull();
  });
});

const ok = (schema: { safeParse(v: unknown): { success: boolean } }, value: unknown) => schema.safeParse(value).success;

describe('5.2 seriesCreateSchema', () => {
  it('needs a list of photo ids', () => {
    expect(ok(seriesCreateSchema, { ids: ['a', 'b'] })).toBe(true);
    expect(ok(seriesCreateSchema, { title: 'Trip', takenOn: '2024-01-01', ids: ['a'] })).toBe(true);
    expect(ok(seriesCreateSchema, {})).toBe(false);
    expect(ok(seriesCreateSchema, { ids: 'a' })).toBe(false);
    expect(ok(seriesCreateSchema, { ids: [1, 2] })).toBe(false);
    expect(ok(seriesCreateSchema, { ids: [''] })).toBe(false);
  });
  it('needs at least one id, with a helpful message', () => {
    expect(() => parseBody(seriesCreateSchema, { ids: [] })).toThrow('Pick at least one photo');
  });
  it('rejects repeated ids and more than 2000', () => {
    expect(() => parseBody(seriesCreateSchema, { ids: ['a', 'a'] })).toThrow('Photos must not repeat');
    expect(ok(seriesCreateSchema, { ids: Array.from({ length: 2001 }, (_, i) => `id${i}`) })).toBe(false);
    expect(ok(seriesCreateSchema, { ids: Array.from({ length: 2000 }, (_, i) => `id${i}`) })).toBe(true);
  });
});

describe('5.2 seriesPatchSchema', () => {
  it('everything is optional', () => {
    expect(ok(seriesPatchSchema, {})).toBe(true);
    expect(ok(seriesPatchSchema, { coverId: 'p2', note: 'Shared note' })).toBe(true);
  });
  it('allows an empty id list (dissolve) but not repeats', () => {
    expect(ok(seriesPatchSchema, { ids: [] })).toBe(true);
    expect(ok(seriesPatchSchema, { ids: ['a', 'b'] })).toBe(true);
    expect(ok(seriesPatchSchema, { ids: ['a', 'a'] })).toBe(false);
  });
  it('rejects an empty coverId', () => {
    expect(ok(seriesPatchSchema, { coverId: '' })).toBe(false);
  });
});

