// EXERCISE 2.1: the media repository. Make `npm run ex -- 2.1` pass.
//
// A repository is a class that owns the SQL for one kind of thing. The rest of the app calls
// `media.listReady(userId)` and never sees a SELECT. Two big ideas here:
//   1. Every query that touches one item also checks user_id. That is what stops Alice reading Bob's photos.
//   2. Rows use snake_case (taken_on) but our TypeScript types use camelCase (takenOn): the repository converts.
//
// SQL cheat sheet for node:sqlite (use ? placeholders, never paste values into the SQL text):
//   db.prepare('INSERT INTO t (a, b) VALUES (?, ?)').run(1, 'x')    // returns { changes, lastInsertRowid }
//   db.prepare('SELECT * FROM t WHERE id = ?').get(5)                // one row, or undefined
//   db.prepare('SELECT * FROM t WHERE a = ?').all(1)                 // array of rows
// Use null (not undefined) for "no value".
import { randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type { MediaItem, MediaKind } from '@memory-vault/shared';

/** A row as the server sees it: the public item plus private details. */
export interface MediaRow extends MediaItem {
  userId: number;
  storageKey: string;
  status: 'pending' | 'ready';
}

export interface NewPending {
  userId: number;
  name: string;
  size: number;
  takenOn: string;
  storageKey: string;
}

export class MediaRepo {
  constructor(private db: DatabaseSync) {}

  /**
   * Record an upload that has been announced but not verified yet.
   *  - id: 12 random bytes as hex (24 characters)
   *  - status 'pending', kind 'image' and mime 'application/octet-stream' for now (the real type is learned later)
   *  - title/note/tags empty, seriesId null, position 0, createdAt = updatedAt = Date.now()
   * Return the new id.
   */
  createPending(input: NewPending): string {
    throw new Error('Not implemented: MediaRepo.createPending');
  }

  /** The upload checked out: set kind and mime and change the status to 'ready'. */
  markReady(id: string, type: { kind: MediaKind; mime: string }): void {
    throw new Error('Not implemented: MediaRepo.markReady');
  }

  /** The pending item with this id that belongs to this user, or null. */
  findPending(id: string, userId: number): MediaRow | null {
    throw new Error('Not implemented: MediaRepo.findPending');
  }

  /** The READY item with this id that belongs to this user, or null. Pending items are invisible here. */
  findReady(id: string, userId: number): MediaRow | null {
    throw new Error('Not implemented: MediaRepo.findReady');
  }

  /**
   * All READY items of this user as public MediaItem objects (no userId, no storageKey, no status),
   * ordered by position, then by createdAt.
   */
  listReady(userId: number): MediaItem[] {
    throw new Error('Not implemented: MediaRepo.listReady');
  }

  /**
   * Change only the fields that are present in `patch` (the others keep their value) and set updatedAt.
   * Return true when an item of this user was updated, false when there is no such item.
   */
  update(id: string, userId: number, patch: Partial<Pick<MediaItem, 'title' | 'note' | 'tags' | 'takenOn'>>): boolean {
    throw new Error('Not implemented: MediaRepo.update');
  }

  /**
   * Delete a READY item of this user and return the row that was deleted (the caller needs its storageKey to delete
   * the file too). Return null when there is nothing to delete.
   */
  remove(id: string, userId: number): MediaRow | null {
    throw new Error('Not implemented: MediaRepo.remove');
  }

  /** Pending items created before `timestamp` (milliseconds), for any user. Used to clean up abandoned uploads. */
  listPendingOlderThan(timestamp: number): MediaRow[] {
    throw new Error('Not implemented: MediaRepo.listPendingOlderThan');
  }

  /** Delete the row with this id whoever owns it (used when an upload turns out to be bad). */
  discard(id: string): void {
    throw new Error('Not implemented: MediaRepo.discard');
  }
}
