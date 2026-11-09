import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createMemoryStorage, createTestContext } from '../test-support/context';
import { placement, seedMany, seedMedia } from '../test-support/db';

function setup() {
  const storage = createMemoryStorage();
  const ctx = createTestContext({ storage });
  return { ...ctx, storage };
}

describe('5.2 GET /api/library', () => {
  it('needs a login', async () => {
    const { anonymous } = setup();
    expect((await anonymous().get('/api/library')).status).toBe(401);
  });

  it('returns the media and series of the signed-in user only', async () => {
    const { as, db, alice, bob, series } = setup();
    const mine = seedMany(db, alice, 2);
    seedMany(db, bob, 3);
    const seriesId = series.create(alice, { title: 'Trip' }, mine);
    const res = await as(alice).get('/api/library');
    expect(res.status).toBe(200);
    expect(res.body.media.map((m: { id: string }) => m.id).sort()).toEqual([...mine].sort());
    expect(res.body.series).toHaveLength(1);
    expect(res.body.series[0]).toMatchObject({ id: seriesId, title: 'Trip', coverId: mine[0] });
    expect(JSON.stringify(res.body)).not.toContain('storageKey');
  });
});

describe('5.2 PATCH and DELETE /api/media/:id', () => {
  it('updates the notes', async () => {
    const { as, db, alice, media } = setup();
    const id = seedMedia(db, alice);
    const res = await as(alice).patch(`/api/media/${id}`).send({ title: 'Beach', note: 'Fun day', tags: 'family', takenOn: '2024-07-04' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(media.findReady(id, alice)).toMatchObject({ title: 'Beach', note: 'Fun day', tags: 'family', takenOn: '2024-07-04' });
  });

  it('rejects bad input with 400 and a message', async () => {
    const { as, db, alice } = setup();
    const id = seedMedia(db, alice);
    const res = await as(alice).patch(`/api/media/${id}`).send({ takenOn: '2023-02-30' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Date must be YYYY-MM-DD' });
  });

  it('answers 404 for unknown items and for another user\'s items', async () => {
    const { as, db, alice, bob, media } = setup();
    const id = seedMedia(db, alice, { title: 'Mine' });
    expect((await as(alice).patch('/api/media/nope').send({ title: 'x' })).status).toBe(404);
    expect((await as(bob).patch(`/api/media/${id}`).send({ title: 'hacked' })).status).toBe(404);
    expect((await as(bob).delete(`/api/media/${id}`)).status).toBe(404);
    expect(media.findReady(id, alice)?.title).toBe('Mine');
  });

  it('refuses a change without the CSRF token', async () => {
    const { app, sessions, db, alice } = setup();
    const id = seedMedia(db, alice);
    const { token } = sessions.create(alice);
    const res = await request(app).patch(`/api/media/${id}`).set('Cookie', `vault_sid=${token}`).send({ title: 'x' });
    expect(res.status).toBe(403);
  });

  it('delete removes the record and the stored file', async () => {
    const { as, db, alice, media, storage } = setup();
    const id = seedMedia(db, alice, { storageKey: 'file-1' });
    storage.put('file-1', new Uint8Array([1, 2, 3]));
    const res = await as(alice).delete(`/api/media/${id}`);
    expect(res.status).toBe(200);
    expect(media.findReady(id, alice)).toBeNull();
    expect(storage.has('file-1')).toBe(false);
  });

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
