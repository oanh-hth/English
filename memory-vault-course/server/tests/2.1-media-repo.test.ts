import { describe, expect, it } from 'vitest';
import { MediaRepo } from '../src/db/mediaRepo';
import { seedMedia, testDb } from '../test-support/db';

function setup() {
  const t = testDb();
  return { ...t, repo: new MediaRepo(t.db) };
}
const pending = (userId: number, key = 'k1') => ({ userId, name: 'beach.jpg', size: 1234, takenOn: '2024-07-04', storageKey: key });

describe('2.1 MediaRepo: uploads', () => {
  it('createPending returns a 24-character id and keeps the item invisible', () => {
    const { repo, alice } = setup();
    const id = repo.createPending(pending(alice));
    expect(id).toMatch(/^[0-9a-f]{24}$/);
    expect(repo.listReady(alice)).toEqual([]);
    expect(repo.findReady(id, alice)).toBeNull();
    const row = repo.findPending(id, alice);
    expect(row).toMatchObject({ id, userId: alice, originalName: 'beach.jpg', size: 1234, takenOn: '2024-07-04', storageKey: 'k1', status: 'pending', seriesId: null, position: 0 });
  });

  it('markReady sets the real type and makes the item visible', () => {
    const { repo, alice } = setup();
    const id = repo.createPending(pending(alice));
    repo.markReady(id, { kind: 'video', mime: 'video/mp4' });
    expect(repo.findPending(id, alice)).toBeNull();
    expect(repo.findReady(id, alice)).toMatchObject({ kind: 'video', mime: 'video/mp4', status: 'ready' });
    expect(repo.listReady(alice)).toHaveLength(1);
  });

  it('only the owner can find a pending item', () => {
    const { repo, alice, bob } = setup();
    const id = repo.createPending(pending(alice));
    expect(repo.findPending(id, bob)).toBeNull();
  });

  it('lists and discards abandoned uploads', () => {
    const { repo, alice, bob } = setup();
    const a = repo.createPending(pending(alice, 'k1'));
    const b = repo.createPending(pending(bob, 'k2'));
    expect(repo.listPendingOlderThan(Date.now() + 10_000).map((r) => r.id).sort()).toEqual([a, b].sort());
    expect(repo.listPendingOlderThan(0)).toEqual([]);
    repo.discard(a);
    expect(repo.listPendingOlderThan(Date.now() + 10_000).map((r) => r.id)).toEqual([b]);
  });
});

describe('2.1 MediaRepo: reading', () => {
  it('listReady returns public items in camelCase without private fields', () => {
    const { repo, db, alice } = setup();
    const id = seedMedia(db, alice, { title: 'Sunset' });
    const [item] = repo.listReady(alice);
    expect(item).toMatchObject({ id, kind: 'image', mime: 'image/jpeg', originalName: `${id}.jpg`, title: 'Sunset', seriesId: null, position: 0 });
    expect(item).not.toHaveProperty('storageKey');
    expect(item).not.toHaveProperty('userId');
    expect(item).not.toHaveProperty('status');
  });

  it('orders by position, then by createdAt', () => {
    const { repo, db, alice } = setup();
    seedMedia(db, alice, { id: 'late', position: 0, createdAt: 300 });
    seedMedia(db, alice, { id: 'early', position: 0, createdAt: 100 });
    seedMedia(db, alice, { id: 'second', position: 1, createdAt: 50 });
    expect(repo.listReady(alice).map((m) => m.id)).toEqual(['early', 'late', 'second']);
  });

  it('never shows another user\'s items', () => {
    const { repo, db, alice, bob } = setup();
    const mine = seedMedia(db, alice);
    seedMedia(db, bob);
    expect(repo.listReady(alice).map((m) => m.id)).toEqual([mine]);
    expect(repo.findReady(mine, bob)).toBeNull();
  });
});

describe('2.1 MediaRepo: update and remove', () => {
  it('changes only the fields you pass', () => {
    const { repo, db, alice } = setup();
    const id = seedMedia(db, alice, { title: 'Old' });
    expect(repo.update(id, alice, { note: 'A note', tags: 'a, b' })).toBe(true);
    expect(repo.findReady(id, alice)).toMatchObject({ title: 'Old', note: 'A note', tags: 'a, b', takenOn: '' });
    expect(repo.update(id, alice, { takenOn: '2020-02-02', title: 'New' })).toBe(true);
    expect(repo.findReady(id, alice)).toMatchObject({ title: 'New', note: 'A note', takenOn: '2020-02-02' });
  });

  it('returns false for unknown items and for items of someone else', () => {
    const { repo, db, alice, bob } = setup();
    const id = seedMedia(db, alice, { title: 'Mine' });
    expect(repo.update('nope', alice, { title: 'x' })).toBe(false);
    expect(repo.update(id, bob, { title: 'hacked' })).toBe(false);
    expect(repo.findReady(id, alice)?.title).toBe('Mine');
  });

  it('does not update pending items', () => {
    const { repo, alice } = setup();
    const id = repo.createPending(pending(alice));
    expect(repo.update(id, alice, { title: 'x' })).toBe(false);
  });

  it('remove returns the deleted row (with its storage key) and deletes it', () => {
    const { repo, db, alice } = setup();
    const id = seedMedia(db, alice, { storageKey: 'file-123' });
    const row = repo.remove(id, alice);
    expect(row?.storageKey).toBe('file-123');
    expect(repo.findReady(id, alice)).toBeNull();
    expect(repo.remove(id, alice)).toBeNull();
  });

  it('remove cannot delete someone else\'s item', () => {
    const { repo, db, alice, bob } = setup();
    const id = seedMedia(db, alice);
    expect(repo.remove(id, bob)).toBeNull();
    expect(repo.findReady(id, alice)).not.toBeNull();
  });
});
