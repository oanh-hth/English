import { describe, expect, it } from 'vitest';
import { SeriesRepo } from '../src/db/seriesRepo';
import { placement, seedMany, seedMedia, testDb } from '../test-support/db';

function setup() {
  const t = testDb();
  return { ...t, repo: new SeriesRepo(t.db) };
}

describe('5.1 SeriesRepo.create', () => {
  it('stores the photos in the given order and uses the first as cover', () => {
    const { repo, db, alice } = setup();
    const [a, b, c] = seedMany(db, alice, 3);
    const id = repo.create(alice, { title: 'Hanoi trip', takenOn: '2023-11-02' }, [c, a, b]);
    expect(id).toMatch(/^[0-9a-f]{24}$/);
    expect(repo.get(id, alice)).toMatchObject({ id, title: 'Hanoi trip', takenOn: '2023-11-02', note: '', tags: '', coverId: c });
    expect(placement(db, [c, a, b])).toEqual([
      { id: c, seriesId: id, position: 0 },
      { id: a, seriesId: id, position: 1 },
      { id: b, seriesId: id, position: 2 },
    ]);
  });

  it('uses "New series" when no title is given', () => {
    const { repo, db, alice } = setup();
    const ids = seedMany(db, alice, 2);
    expect(repo.get(repo.create(alice, {}, ids), alice)?.title).toBe('New series');
    const more = seedMany(db, alice, 2);
    expect(repo.get(repo.create(alice, { title: '' }, more), alice)?.title).toBe('New series');
  });

  it('rejects empty lists, repeats, unknown ids, pending items and other people\'s photos', () => {
    const { repo, db, alice, bob } = setup();
    const [a] = seedMany(db, alice, 1);
    const pending = seedMedia(db, alice, { status: 'pending' });
    const theirs = seedMedia(db, bob);
    expect(() => repo.create(alice, {}, [])).toThrow('INVALID_IDS');
    expect(() => repo.create(alice, {}, [a, a])).toThrow('INVALID_IDS');
    expect(() => repo.create(alice, {}, [a, 'nope'])).toThrow('INVALID_IDS');
    expect(() => repo.create(alice, {}, [a, pending])).toThrow('INVALID_IDS');
    expect(() => repo.create(alice, {}, [a, theirs])).toThrow('INVALID_IDS');
    expect(repo.list(alice)).toEqual([]); // nothing was created
    expect(placement(db, [a])[0].seriesId).toBeNull();
  });
});

describe('5.1 SeriesRepo.list / get', () => {
  it('only shows the user\'s own series', () => {
    const { repo, db, alice, bob } = setup();
    const mine = repo.create(alice, { title: 'Mine' }, seedMany(db, alice, 1));
    repo.create(bob, { title: 'Theirs' }, seedMany(db, bob, 1));
    expect(repo.list(alice).map((s) => s.id)).toEqual([mine]);
    expect(repo.get(mine, bob)).toBeNull();
    expect(repo.get('nope', alice)).toBeNull();
  });
});

describe('5.1 SeriesRepo.update', () => {
  it('changes only the fields given', () => {
    const { repo, db, alice } = setup();
    const id = repo.create(alice, { title: 'Trip', tags: 'a' }, seedMany(db, alice, 2));
    expect(repo.update(id, alice, { note: 'Shared note' })).toBe(true);
    expect(repo.get(id, alice)).toMatchObject({ title: 'Trip', tags: 'a', note: 'Shared note' });
  });

  it('returns false for an unknown series or one that belongs to someone else', () => {
    const { repo, db, alice, bob } = setup();
    const id = repo.create(alice, { title: 'Trip' }, seedMany(db, alice, 1));
    expect(repo.update('nope', alice, { title: 'x' })).toBe(false);
    expect(repo.update(id, bob, { title: 'hacked' })).toBe(false);
    expect(repo.get(id, alice)?.title).toBe('Trip');
  });

  it('reorders photos', () => {
    const { repo, db, alice } = setup();
    const [a, b, c] = seedMany(db, alice, 3);
    const id = repo.create(alice, {}, [a, b, c]);
    repo.update(id, alice, { ids: [c, a, b] });
    expect(placement(db, [c, a, b]).map((p) => p.position)).toEqual([0, 1, 2]);
  });

  it('lets photos leave: unlisted photos become loose', () => {
    const { repo, db, alice } = setup();
    const [a, b, c] = seedMany(db, alice, 3);
    const id = repo.create(alice, {}, [a, b, c]);
    repo.update(id, alice, { ids: [a, c] });
    expect(placement(db, [a, b, c])).toEqual([
      { id: a, seriesId: id, position: 0 },
      { id: b, seriesId: null, position: expect.any(Number) },
      { id: c, seriesId: id, position: 1 },
    ]);
  });

  it('adds photos to the end', () => {
    const { repo, db, alice } = setup();
    const [a, b, extra] = seedMany(db, alice, 3);
    const id = repo.create(alice, {}, [a, b]);
    repo.update(id, alice, { ids: [a, b, extra] });
    expect(placement(db, [extra])[0]).toEqual({ id: extra, seriesId: id, position: 2 });
  });

  it('sets the cover, and gives the series a new cover when the old one leaves', () => {
    const { repo, db, alice } = setup();
    const [a, b, c] = seedMany(db, alice, 3);
    const id = repo.create(alice, {}, [a, b, c]);
    expect(repo.get(id, alice)?.coverId).toBe(a);
    repo.update(id, alice, { coverId: c });
    expect(repo.get(id, alice)?.coverId).toBe(c);
    repo.update(id, alice, { ids: [a, b] }); // c (the cover) leaves
    expect(repo.get(id, alice)?.coverId).toBe(a);
  });

  it('dissolves the series when the list is empty', () => {
    const { repo, db, alice } = setup();
    const [a, b] = seedMany(db, alice, 2);
    const id = repo.create(alice, {}, [a, b]);
    expect(repo.update(id, alice, { ids: [] })).toBe(true);
    expect(repo.get(id, alice)).toBeNull();
    expect(placement(db, [a, b]).map((p) => p.seriesId)).toEqual([null, null]);
  });

  it('throws INVALID_IDS and changes nothing for bad lists', () => {
    const { repo, db, alice, bob } = setup();
    const [a, b] = seedMany(db, alice, 2);
    const theirs = seedMedia(db, bob);
    const id = repo.create(alice, { title: 'Keep' }, [a, b]);
    expect(() => repo.update(id, alice, { title: 'Changed', ids: [a, theirs] })).toThrow('INVALID_IDS');
    expect(() => repo.update(id, alice, { ids: [a, a] })).toThrow('INVALID_IDS');
    expect(repo.get(id, alice)?.title).toBe('Keep');
    expect(placement(db, [a, b]).map((p) => p.seriesId)).toEqual([id, id]);
  });

  it('moving a photo to another series tidies the old one', () => {
    const { repo, db, alice } = setup();
    const [a, b, c] = seedMany(db, alice, 3);
    const first = repo.create(alice, {}, [a]); // will lose its only photo
    const second = repo.create(alice, {}, [b, c]);
    repo.update(second, alice, { ids: [b, c, a] });
    expect(repo.get(first, alice)).toBeNull(); // empty series is deleted
    expect(placement(db, [a])[0]).toEqual({ id: a, seriesId: second, position: 2 });
  });
});

describe('5.1 SeriesRepo.tidy', () => {
  it('deletes series whose photos were all deleted and fixes covers', () => {
    const { repo, db, alice } = setup();
    const [a, b] = seedMany(db, alice, 2);
    const [only] = seedMany(db, alice, 1);
    const s1 = repo.create(alice, {}, [a, b]);
    const s2 = repo.create(alice, {}, [only]);
    db.prepare('DELETE FROM media WHERE id = ?').run(a); // delete the cover of s1
    db.prepare('DELETE FROM media WHERE id = ?').run(only); // empty s2
    repo.tidy(alice);
    expect(repo.get(s2, alice)).toBeNull();
    expect(repo.get(s1, alice)?.coverId).toBe(b);
  });
});

describe('5.1 SeriesRepo.removeWithItems', () => {
  it('deletes the series and its photos and returns their storage keys', () => {
    const { repo, db, alice } = setup();
    const a = seedMedia(db, alice, { storageKey: 'file-a' });
    const b = seedMedia(db, alice, { storageKey: 'file-b' });
    const keep = seedMedia(db, alice, { storageKey: 'file-keep' });
    const id = repo.create(alice, {}, [a, b]);
    expect((repo.removeWithItems(id, alice) ?? []).sort()).toEqual(['file-a', 'file-b']);
    expect(repo.get(id, alice)).toBeNull();
    expect(db.prepare('SELECT COUNT(*) AS n FROM media WHERE id IN (?, ?)').get(a, b)).toEqual({ n: 0 });
    expect(db.prepare('SELECT COUNT(*) AS n FROM media WHERE id = ?').get(keep)).toEqual({ n: 1 });
  });

  it('returns null for an unknown series or someone else\'s', () => {
    const { repo, db, alice, bob } = setup();
    const id = repo.create(alice, {}, seedMany(db, alice, 1));
    expect(repo.removeWithItems('nope', alice)).toBeNull();
    expect(repo.removeWithItems(id, bob)).toBeNull();
    expect(repo.get(id, alice)).not.toBeNull();
  });
});
