// EXERCISE 3.2: edit and delete a memory. Make `npm run ex -- 3.2` pass.
//
// Validate the body (3.1), call the repository (2.1), answer. Errors: throw new HttpError(404, 'Not found') and the
// error handler sends {"error":"Not found"}. In an async route wrap the handler in asyncHandler(...).
import { Router } from 'express';
import type { MediaRepo } from '../../db/mediaRepo';
import type { SeriesRepo } from '../../db/seriesRepo';
import type { Storage } from '../../storage/types';
import { asyncHandler, HttpError } from '../errors';
import { mediaPatchSchema, parseBody } from '../validation';

export interface MediaRouterDeps {
  media: MediaRepo;
  series: SeriesRepo;
  storage: Storage;
}

/**
 * PATCH  /media/:id  validate the body with mediaPatchSchema, then media.update(id, userId, patch).
 *                    Unknown id or someone else's item: 404 'Not found'. Success: { ok: true }
 * DELETE /media/:id  media.remove(id, userId) returns the deleted row (or null: 404 'Not found').
 *                    Then delete the FILE too: storage.remove(row.storageKey). Success: { ok: true }
 *                    (Part 5 will come back here: when a photo leaves, its series may need tidying.)
 * userId is req.session!.userId.
 */
export function mediaRouter(deps: MediaRouterDeps): Router {
  const router = Router();
  // TODO: add the two routes described above.
  return router;
}
