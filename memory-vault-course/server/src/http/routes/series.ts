// EXERCISE 5.2: the series routes. Make `npm run ex -- 5.2` pass.
//
// Same recipe as before: validate, call the repository (5.1), answer. The series rules (order, cover, tidy) live in
// SeriesRepo, so these routes stay short. You also finish two things from earlier parts:
//   - validation.ts: replace the z.any() of seriesCreateSchema and seriesPatchSchema with real schemas
//   - routes/media.ts: DELETE /media/:id must now call series.tidy(userId) after removing the row, because a deleted photo
//     can leave a series empty (an empty series must disappear)
import { Router } from 'express';
import type { MediaRepo } from '../../db/mediaRepo';
import type { SeriesRepo } from '../../db/seriesRepo';
import type { Storage } from '../../storage/types';
import { asyncHandler, HttpError } from '../errors';
import { parseBody, seriesCreateSchema, seriesPatchSchema } from '../validation';

export interface SeriesRouterDeps {
  media: MediaRepo;
  series: SeriesRepo;
  storage: Storage;
}

/**
 * POST   /series      validate with seriesCreateSchema, then series.create(userId, { title, note, tags, takenOn }, ids).
 *                     SeriesRepo throws Error('INVALID_IDS') for photos that are not the user's: answer 400
 *                     'Pick existing photos or videos'. Success: 201 { id }
 * PATCH  /series/:id  validate with seriesPatchSchema, then series.update(id, userId, body). false: 404 'Not found'.
 *                     INVALID_IDS: 400 'Invalid photo list'. Success: { ok: true }
 * DELETE /series/:id  series.removeWithItems(id, userId) returns the storage keys of the deleted photos (or null: 404).
 *                     Delete each file with storage.remove. Success: { ok: true }
 * userId is req.session!.userId.
 * Tip: write a small helper that runs a repository call and turns the INVALID_IDS error into new HttpError(400, message).
 */
export function seriesRouter(deps: SeriesRouterDeps): Router {
  const router = Router();
  // TODO: add the three routes described above.
  return router;
}
