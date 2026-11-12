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

export function mediaRouter({ media, series, storage }: MediaRouterDeps): Router {
  const router = Router();

  router.patch('/media/:id', (req, res) => {
    const patch = parseBody(mediaPatchSchema, req.body);
    if (!media.update(req.params.id, req.session!.userId, patch)) throw new HttpError(404, 'Not found');
    res.json({ ok: true });
  });

  router.delete(
    '/media/:id',
    asyncHandler(async (req, res) => {
      const userId = req.session!.userId;
      const row = media.remove(req.params.id, userId);
      if (!row) throw new HttpError(404, 'Not found');
      series.tidy(userId); // the photo may have been the last one of a series
      await storage.remove(row.storageKey);
      res.json({ ok: true });
    }),
  );

  return router;
}
