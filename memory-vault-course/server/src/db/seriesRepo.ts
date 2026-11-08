// EXERCISE 3.2: the series repository. Make `npm run ex -- 3.2` pass.
//
// A series is a row in `series` plus the photos that point to it with media.series_id and media.position.
// This repository keeps the RULES, so no route can break them:
//   - the first photo of a new series is its cover
//   - photos keep the order they are given (position 0, 1, 2, ...)
//   - a series with no photos is deleted
//   - if a series' cover is no longer one of its photos, the first remaining photo becomes the cover
//   - a user can only put their OWN, READY photos into a series
//
// New idea: a TRANSACTION groups several changes so they all happen or none do:
//     this.db.exec('BEGIN');
//     try { ...several statements... ; this.db.exec('COMMIT'); } catch (e) { this.db.exec('ROLLBACK'); throw e; }
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
  /** The complete list of photo ids, in order. Photos not listed leave the series. [] dissolves the series. */
  ids?: string[];
};

export class SeriesRepo {
  constructor(private db: DatabaseSync) {}

  /**
   * Create a series from these photo ids (in this order) and return its id (12 random bytes as hex).
   *  - title defaults to 'New series' when missing or empty; note, tags, takenOn default to ''
   *  - cover = the first id
   *  - throw new Error('INVALID_IDS') when ids is empty, has repeats, or any id is unknown, pending or belongs to another user
   *  - a photo that was in another series moves here; that other series must be tidied (see tidy)
   * Do everything in one transaction.
   */
  create(userId: number, fields: Partial<SeriesFields>, ids: string[]): string {
    throw new Error('Not implemented: SeriesRepo.create');
  }

  /** All series of this user as Series objects (camelCase). */
  list(userId: number): Series[] {
    throw new Error('Not implemented: SeriesRepo.list');
  }

  /** One series of this user, or null. */
  get(id: string, userId: number): Series | null {
    throw new Error('Not implemented: SeriesRepo.get');
  }

  /**
   * Change a series. Return false when this user has no such series.
   *  - fields present in the patch replace the old ones; absent ones stay
   *  - coverId, when present, becomes the cover
   *  - ids, when present, is the new complete, ordered list:
   *      listed photos get series_id = this series and position = their index
   *      photos that were in the series but are not listed become loose (series_id NULL)
   *      ids = [] dissolves the series: all photos become loose and the series is deleted by tidy
   *      throw new Error('INVALID_IDS') (and change nothing) for repeats or ids that are not the user's ready photos
   * Finish by calling tidy(userId). One transaction.
   */
  update(id: string, userId: number, patch: SeriesPatch): boolean {
    throw new Error('Not implemented: SeriesRepo.update');
  }

  /**
   * Delete the series AND all its photos. Return the storage keys of the deleted photos so the caller can delete the
   * files, or null when this user has no such series.
   */
  removeWithItems(id: string, userId: number): string[] | null {
    throw new Error('Not implemented: SeriesRepo.removeWithItems');
  }

  /**
   * Repair this user's series after photos moved or were deleted:
   *   1. delete series that have no photos left
   *   2. for series whose cover_id is not one of their photos, set the cover to their first photo (lowest position)
   */
  tidy(userId: number): void {
    throw new Error('Not implemented: SeriesRepo.tidy');
  }
}
