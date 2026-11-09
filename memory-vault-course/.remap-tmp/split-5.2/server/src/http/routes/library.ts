import { Router, type Request } from 'express';
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

const userIdOf = (req: Request) => req.session!.userId;

/** Run a repository call and turn its INVALID_IDS error into a 400. */
function orBadIds<T>(fn: () => T, message: string): T {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_IDS') throw new HttpError(400, message);
    throw error;
  }
}

export function libraryRouter({ media, series, storage }: LibraryRouterDeps): Router {
  const router = Router();

  router.get('/library', (req, res) => {
    const userId = userIdOf(req);
    res.json({ media: media.listReady(userId), series: series.list(userId) });
  });

  router.patch('/media/:id', (req, res) => {
    const patch = parseBody(mediaPatchSchema, req.body);
    if (!media.update(req.params.id, userIdOf(req), patch)) throw new HttpError(404, 'Not found');
    res.json({ ok: true });
  });

  router.delete(
    '/media/:id',
    asyncHandler(async (req, res) => {
      const userId = userIdOf(req);
      const row = media.remove(req.params.id, userId);
      if (!row) throw new HttpError(404, 'Not found');
      series.tidy(userId);
      await storage.remove(row.storageKey);
      res.json({ ok: true });
    }),
  );

  router.post('/series', (req, res) => {
    const { ids, ...fields } = parseBody(seriesCreateSchema, req.body);
    const id = orBadIds(() => series.create(userIdOf(req), fields, ids), 'Pick existing photos or videos');
    res.status(201).json({ id });
  });

  router.patch('/series/:id', (req, res) => {
    const body = parseBody(seriesPatchSchema, req.body);
    const found = orBadIds(() => series.update(req.params.id, userIdOf(req), body), 'Invalid photo list');
    if (!found) throw new HttpError(404, 'Not found');
    res.json({ ok: true });
  });

  router.delete(
    '/series/:id',
    asyncHandler(async (req, res) => {
      const keys = series.removeWithItems(req.params.id, userIdOf(req));
      if (!keys) throw new HttpError(404, 'Not found');
      await Promise.all(keys.map((key) => storage.remove(key)));
      res.json({ ok: true });
    }),
  );

  return router;
}
