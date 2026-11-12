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

/** Run a repository call and turn its INVALID_IDS error into a 400. */
function orBadIds<T>(fn: () => T, message: string): T {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_IDS') throw new HttpError(400, message);
    throw error;
  }
}

export function seriesRouter({ series, storage }: SeriesRouterDeps): Router {
  const router = Router();

  router.post('/series', (req, res) => {
    const { ids, ...fields } = parseBody(seriesCreateSchema, req.body);
    const id = orBadIds(() => series.create(req.session!.userId, fields, ids), 'Pick existing photos or videos');
    res.status(201).json({ id });
  });

  router.patch('/series/:id', (req, res) => {
    const body = parseBody(seriesPatchSchema, req.body);
    const found = orBadIds(() => series.update(req.params.id, req.session!.userId, body), 'Invalid photo list');
    if (!found) throw new HttpError(404, 'Not found');
    res.json({ ok: true });
  });

  router.delete(
    '/series/:id',
    asyncHandler(async (req, res) => {
      const keys = series.removeWithItems(req.params.id, req.session!.userId);
      if (!keys) throw new HttpError(404, 'Not found');
      await Promise.all(keys.map((key) => storage.remove(key)));
      res.json({ ok: true });
    }),
  );

  return router;
}
