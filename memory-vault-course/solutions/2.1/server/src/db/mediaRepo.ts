import { randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type { MediaItem, MediaKind } from '@memory-vault/shared';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

function toItem(r: Raw): MediaItem {
  return {
    id: r.id, kind: r.kind, mime: r.mime, originalName: r.original_name, size: r.size, title: r.title, note: r.note,
    tags: r.tags, takenOn: r.taken_on, seriesId: r.series_id ?? null, position: r.position, createdAt: r.created_at,
  };
}
const toRow = (r: Raw): MediaRow => ({ ...toItem(r), userId: r.user_id, storageKey: r.storage_key, status: r.status });

export class MediaRepo {
  constructor(private db: DatabaseSync) {}

  createPending(input: NewPending): string {
    const id = randomBytes(12).toString('hex');
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO media (id, user_id, kind, mime, original_name, size, storage_key, taken_on, status, created_at, updated_at)
         VALUES (?, ?, 'image', 'application/octet-stream', ?, ?, ?, ?, 'pending', ?, ?)`,
      )
      .run(id, input.userId, input.name, input.size, input.storageKey, input.takenOn, now, now);
    return id;
  }

  markReady(id: string, type: { kind: MediaKind; mime: string }): void {
    this.db.prepare("UPDATE media SET kind = ?, mime = ?, status = 'ready', updated_at = ? WHERE id = ?").run(type.kind, type.mime, Date.now(), id);
  }

  findPending(id: string, userId: number): MediaRow | null {
    const r = this.db.prepare("SELECT * FROM media WHERE id = ? AND user_id = ? AND status = 'pending'").get(id, userId);
    return r ? toRow(r) : null;
  }

  findReady(id: string, userId: number): MediaRow | null {
    const r = this.db.prepare("SELECT * FROM media WHERE id = ? AND user_id = ? AND status = 'ready'").get(id, userId);
    return r ? toRow(r) : null;
  }

  listReady(userId: number): MediaItem[] {
    const rows = this.db.prepare("SELECT * FROM media WHERE user_id = ? AND status = 'ready' ORDER BY position, created_at").all(userId);
    return rows.map(toItem);
  }

  update(id: string, userId: number, patch: Partial<Pick<MediaItem, 'title' | 'note' | 'tags' | 'takenOn'>>): boolean {
    const current = this.findReady(id, userId);
    if (!current) return false;
    this.db
      .prepare('UPDATE media SET title = ?, note = ?, tags = ?, taken_on = ?, updated_at = ? WHERE id = ? AND user_id = ?')
      .run(patch.title ?? current.title, patch.note ?? current.note, patch.tags ?? current.tags, patch.takenOn ?? current.takenOn, Date.now(), id, userId);
    return true;
  }

  remove(id: string, userId: number): MediaRow | null {
    const row = this.findReady(id, userId);
    if (!row) return null;
    this.db.prepare('DELETE FROM media WHERE id = ? AND user_id = ?').run(id, userId);
    return row;
  }

  listPendingOlderThan(timestamp: number): MediaRow[] {
    return this.db.prepare("SELECT * FROM media WHERE status = 'pending' AND created_at < ?").all(timestamp).map(toRow);
  }

  discard(id: string): void {
    this.db.prepare('DELETE FROM media WHERE id = ?').run(id);
  }
}
