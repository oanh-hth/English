import fs from 'node:fs';
import { Router } from 'express';
import type { MediaRepo } from '../../db/mediaRepo';
import type { Storage } from '../../storage/types';
import { asyncHandler } from '../errors';
import { parseRange } from '../range';

export interface FilesRouterDeps {
  media: MediaRepo;
  storage: Storage;
}

export function filesRouter({ media, storage }: FilesRouterDeps): Router {
  const router = Router();

  router.get(
    '/media/:id/file',
    asyncHandler(async (req, res) => {
      const item = media.findReady(req.params.id, req.session!.userId);
      if (!item) return void res.status(404).end();
      const download = req.query.download === '1';
      const filename = item.originalName.replace(/[\r\n"]/g, '_');

      const url = await storage.getUrl(item.storageKey, { mime: item.mime, filename, download });
      if (url) return void res.redirect(302, url);

      const size = await storage.head(item.storageKey);
      if (size === null || !storage.localPath) return void res.status(404).end();
      const range = parseRange(req.headers.range, size);
      if (range.status === 416) return void res.status(416).set('Content-Range', `bytes */${size}`).end();

      res.status(range.status).set({
        'Content-Type': item.mime,
        'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(range.end - range.start + 1),
        'Cache-Control': 'private, no-cache',
      });
      if (range.status === 206) res.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
      fs.createReadStream(storage.localPath(item.storageKey), { start: range.start, end: range.end }).pipe(res);
    }),
  );

  return router;
}
