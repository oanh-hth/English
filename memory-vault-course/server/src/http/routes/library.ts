// EXERCISE 2.4 (part 1 of 2): the library route. Make `npm run ex -- 2.4` pass.
//
// A router groups routes: app.use('/api', libraryRouter(...)) means router.get('/library') answers GET /api/library.
// By the time a request reaches a router, the sign-in middleware has already run, so `req.session!.userId` is the user.
// Routes stay thin: call a repository, answer with JSON. The rules live in the repositories.
//
// Handy:   res.json(x)   res.status(201).json(x)   req.params.id (from "/media/:id")   req.body (parsed JSON)
import { Router } from 'express';
import type { MediaRepo } from '../../db/mediaRepo';
import type { SeriesRepo } from '../../db/seriesRepo';

export interface LibraryRouterDeps {
  media: MediaRepo;
  series: SeriesRepo;
}

/**
 * GET /library  ->  200 { media: media.listReady(userId), series: series.list(userId) }
 * where userId is req.session!.userId. Only the signed-in user's own items, never anybody else's.
 */
export function libraryRouter(deps: LibraryRouterDeps): Router {
  const router = Router();
  // TODO: add the route described above.
  return router;
}
