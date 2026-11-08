// Given test helpers. They write rows with plain SQL on purpose, so repository tests do not depend on each other.
import type { DatabaseSync } from 'node:sqlite';
import { openDb } from '../src/db/schema';

export function testDb(): { db: DatabaseSync; alice: number; bob: number } {
  const db = openDb(':memory:');
  const add = (name: string) => Number(db.prepare('INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)').run(name, 'x', 0).lastInsertRowid);
  return { db, alice: add('alice'), bob: add('bob') };
}

let counter = 0;
export interface SeedOptions {
  id?: string;
  kind?: 'image' | 'video';
  status?: 'pending' | 'ready';
  title?: string;
  createdAt?: number;
  position?: number;
  seriesId?: string | null;
  storageKey?: string;
  size?: number;
}

/** Insert one media row directly and return its id. */
export function seedMedia(db: DatabaseSync, userId: number, o: SeedOptions = {}): string {
  counter += 1;
  const id = o.id ?? `m${counter}`;
  db.prepare(
    `INSERT INTO media (id, user_id, kind, mime, original_name, size, storage_key, title, status, series_id, position, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id, userId, o.kind ?? 'image', o.kind === 'video' ? 'video/mp4' : 'image/jpeg', `${id}.jpg`, o.size ?? 100,
    o.storageKey ?? `key-${id}`, o.title ?? '', o.status ?? 'ready', o.seriesId ?? null, o.position ?? 0, o.createdAt ?? counter, counter,
  );
  return id;
}

export function seedMany(db: DatabaseSync, userId: number, n: number): string[] {
  return Array.from({ length: n }, () => seedMedia(db, userId));
}

/** Read back (series_id, position) for some media ids, in the order given. */
export function placement(db: DatabaseSync, ids: string[]): { id: string; seriesId: string | null; position: number }[] {
  return ids.map((id) => {
    const r = db.prepare('SELECT series_id, position FROM media WHERE id = ?').get(id) as { series_id: string | null; position: number } | undefined;
    return { id, seriesId: r ? r.series_id : null, position: r ? r.position : -1 };
  });
}
