// EXERCISE 5.2: the library, item and series routes. Make `npm run ex -- 5.2` pass.
//
// A router groups routes: app.use('/api', libraryRouter(...)) means router.get('/library') answers GET /api/library.
// By the time a request reaches this router, requireAuth has already run, so `req.session` is set (see app.ts).
// Each route is thin: validate the body (5.1), call a repository (3.x), send JSON. The rules live in the repositories.
//
// Handy:   req.params.id (from "/media/:id")   req.body (parsed JSON)   res.json(x)   res.status(201).json(x)
//          throw new HttpError(404, 'Not found')  -> the error handler sends {"error":"Not found"} with that status
//          Synchronous routes may throw directly. Async routes must be wrapped in asyncHandler(async (req, res) => { ... }).
import { Router } from 'express';
import type { MediaRepo } from '../../db/mediaRepo';
import type { SeriesRepo } from '../../db/seriesRepo';
import type { Storage } from '../../storage/types';
import { asyncHandler, HttpError } from '../errors';
import { mediaPatchSchema, parseBody, seriesCreateSchema, seriesPatchSchema } from '../validation';

export interface LibraryRouterDeps {
  media: MediaRepo;
  series: SeriesRepo;
  storage: Storage;
}

/**
 * Routes to build (the signed-in user's id is req.session!.userId; always pass it to the repositories):
 *
 *  GET    /library        -> 200 { media: media.listReady(userId), series: series.list(userId) }
 *
 *  PATCH  /media/:id      -> validate with mediaPatchSchema, media.update(...). Not found -> 404 'Not found'. Success: { ok: true }
 *  DELETE /media/:id      -> media.remove(...) gives the deleted row (or null -> 404). Then series.tidy(userId) and
 *                            storage.remove(row.storageKey). Success: { ok: true }
 *
 *  POST   /series         -> validate with seriesCreateSchema, series.create(userId, { title, note, tags, takenOn }, ids).
 *                            The repository throws Error('INVALID_IDS') for photos that are not the user's:
 *                            answer 400 'Pick existing photos or videos'. Success: 201 { id }
 *  PATCH  /series/:id     -> validate with seriesPatchSchema, series.update(id, userId, body). false -> 404.
 *                            INVALID_IDS -> 400 'Invalid photo list'. Success: { ok: true }
 *  DELETE /series/:id     -> series.removeWithItems(id, userId) gives the storage keys (or null -> 404). Delete each file
 *                            with storage.remove. Success: { ok: true }
 */
export function libraryRouter(deps: LibraryRouterDeps): Router {
  const router = Router();
  // TODO: add the routes described above.
  return router;
}
