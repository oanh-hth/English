import { describe, expect, it } from 'vitest';
import { createMemoryStorage, createTestContext } from '../test-support/context';
import { seedMedia } from '../test-support/db';

function setup() {
  const storage = createMemoryStorage();
  const ctx = createTestContext({ storage });
  return { ...ctx, storage };
}

describe('3.2 PATCH and DELETE /api/media/:id', () => {
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

  it('delete removes the record and the stored file', async () => {
    const { as, db, alice, media, storage } = setup();
    const id = seedMedia(db, alice, { storageKey: 'file-1' });
    storage.put('file-1', new Uint8Array([1, 2, 3]));
    const res = await as(alice).delete(`/api/media/${id}`);
    expect(res.status).toBe(200);
    expect(media.findReady(id, alice)).toBeNull();
    expect(storage.has('file-1')).toBe(false);
  });

});

