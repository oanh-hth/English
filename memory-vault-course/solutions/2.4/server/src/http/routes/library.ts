import { Router } from 'express';
import type { MediaRepo } from '../../db/mediaRepo';
import type { SeriesRepo } from '../../db/seriesRepo';

export interface LibraryRouterDeps {
  media: MediaRepo;
  series: SeriesRepo;
}

export function libraryRouter({ media, series }: LibraryRouterDeps): Router {
  const router = Router();
  router.get('/library', (req, res) => {
    const userId = req.session!.userId;
    res.json({ media: media.listReady(userId), series: series.list(userId) });
  });
  return router;
}
