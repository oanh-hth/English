import { randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type { Series } from '@memory-vault/shared';

export interface SeriesFields {
  title: string;
  note: string;
  tags: string;
  takenOn: string;
}

export type SeriesPatch = Partial<SeriesFields> & {
  coverId?: string;
  ids?: string[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toSeries = (r: Record<string, any>): Series => ({
  id: r.id, title: r.title, note: r.note, tags: r.tags, takenOn: r.taken_on, coverId: r.cover_id ?? null, createdAt: r.created_at,
});

export class SeriesRepo {
  constructor(private db: DatabaseSync) {}

  private tx<T>(fn: () => T): T {
    this.db.exec('BEGIN');
    try {
      const result = fn();
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  /** Throws INVALID_IDS unless every id is a distinct, ready photo of this user. */
  private assertUsable(userId: number, ids: string[]): void {
    if (new Set(ids).size !== ids.length) throw new Error('INVALID_IDS');
    if (ids.length === 0) return;
    const marks = ids.map(() => '?').join(',');
    const row = this.db
      .prepare(`SELECT COUNT(*) AS n FROM media WHERE user_id = ? AND status = 'ready' AND id IN (${marks})`)
      .get(userId, ...ids) as { n: number };
    if (row.n !== ids.length) throw new Error('INVALID_IDS');
  }

  private setItems(seriesId: string, userId: number, ids: string[]): void {
    if (ids.length === 0) {
      this.db.prepare('UPDATE media SET series_id = NULL WHERE user_id = ? AND series_id = ?').run(userId, seriesId);
      return;
    }
    const marks = ids.map(() => '?').join(',');
    this.db.prepare(`UPDATE media SET series_id = NULL WHERE user_id = ? AND series_id = ? AND id NOT IN (${marks})`).run(userId, seriesId, ...ids);
    const place = this.db.prepare("UPDATE media SET series_id = ?, position = ? WHERE id = ? AND user_id = ? AND status = 'ready'");
    ids.forEach((id, index) => place.run(seriesId, index, id, userId));
  }

  create(userId: number, fields: Partial<SeriesFields>, ids: string[]): string {
    if (ids.length === 0) throw new Error('INVALID_IDS');
    this.assertUsable(userId, ids);
    const id = randomBytes(12).toString('hex');
    const now = Date.now();
    this.tx(() => {
      this.db
        .prepare('INSERT INTO series (id, user_id, title, note, tags, taken_on, cover_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(id, userId, fields.title || 'New series', fields.note ?? '', fields.tags ?? '', fields.takenOn ?? '', ids[0], now, now);
      this.setItems(id, userId, ids);
      this.tidy(userId);
    });
    return id;
  }

  list(userId: number): Series[] {
    return this.db.prepare('SELECT * FROM series WHERE user_id = ? ORDER BY created_at').all(userId).map(toSeries);
  }

  get(id: string, userId: number): Series | null {
    const row = this.db.prepare('SELECT * FROM series WHERE id = ? AND user_id = ?').get(id, userId);
    return row ? toSeries(row) : null;
  }

  update(id: string, userId: number, patch: SeriesPatch): boolean {
    const current = this.get(id, userId);
    if (!current) return false;
    if (patch.ids !== undefined) this.assertUsable(userId, patch.ids);
    this.tx(() => {
      if (patch.ids !== undefined) this.setItems(id, userId, patch.ids);
      this.db
        .prepare('UPDATE series SET title = ?, note = ?, tags = ?, taken_on = ?, cover_id = ?, updated_at = ? WHERE id = ? AND user_id = ?')
        .run(patch.title ?? current.title, patch.note ?? current.note, patch.tags ?? current.tags, patch.takenOn ?? current.takenOn, patch.coverId ?? current.coverId, Date.now(), id, userId);
      this.tidy(userId);
    });
    return true;
  }

  removeWithItems(id: string, userId: number): string[] | null {
    if (!this.get(id, userId)) return null;
    const keys = (this.db.prepare('SELECT storage_key FROM media WHERE series_id = ? AND user_id = ?').all(id, userId) as { storage_key: string }[]).map((r) => r.storage_key);
    this.tx(() => {
      this.db.prepare('DELETE FROM media WHERE series_id = ? AND user_id = ?').run(id, userId);
      this.db.prepare('DELETE FROM series WHERE id = ? AND user_id = ?').run(id, userId);
    });
    return keys;
  }

  tidy(userId: number): void {
    this.db.prepare('DELETE FROM series WHERE user_id = ? AND id NOT IN (SELECT DISTINCT series_id FROM media WHERE series_id IS NOT NULL)').run(userId);
    this.db
      .prepare(
        `UPDATE series SET cover_id = (SELECT id FROM media WHERE series_id = series.id ORDER BY position LIMIT 1)
         WHERE user_id = ? AND (cover_id IS NULL OR cover_id NOT IN (SELECT id FROM media WHERE series_id = series.id))`,
      )
      .run(userId);
  }
}
