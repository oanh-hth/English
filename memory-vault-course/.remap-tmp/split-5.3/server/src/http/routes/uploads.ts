import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Router, type Request } from 'express';
import type { MediaRepo } from '../../db/mediaRepo';
import type { Storage } from '../../storage/types';
import type { UploadService } from '../../uploads/uploadService';
import { asyncHandler, HttpError } from '../errors';
import { parseRange } from '../range';
import { SizeGuard } from '../sizeGuard';
import { parseBody, uploadInitSchema } from '../validation';

export interface UploadsRouterDeps {
  uploads: UploadService;
  media: MediaRepo;
  storage: Storage;
}

const userIdOf = (req: Request) => req.session!.userId;

export function uploadsRouter({ uploads, media, storage }: UploadsRouterDeps): Router {
  const router = Router();

  router.post(
    '/uploads',
    asyncHandler(async (req, res) => {
      const body = parseBody(uploadInitSchema, req.body);
      res.status(201).json(await uploads.init(userIdOf(req), body));
    }),
  );

  router.put(
    '/uploads/:id/data',
    asyncHandler(async (req, res) => {
      if (storage.direct || !storage.localPath) throw new HttpError(404, 'Not found');
      const row = media.findPending(req.params.id, userIdOf(req));
      if (!row) throw new HttpError(404, 'Not found');
      if (Number(req.headers['content-length']) !== row.size) throw new HttpError(400, 'Size mismatch');

      const dest = storage.localPath(row.storageKey);
      const tmp = `${dest}.part`;
      try {
        await pipeline(req, new SizeGuard(row.size), fs.createWriteStream(tmp, { mode: 0o600 }));
        await fs.promises.rename(tmp, dest);
      } catch (error) {
        await fs.promises.rm(tmp, { force: true });
        throw error;
      }
      res.json({ ok: true });
    }),
  );

  router.post(
    '/uploads/:id/complete',
    asyncHandler(async (req, res) => {
      res.json(await uploads.complete(userIdOf(req), req.params.id));
    }),
  );

  router.get(
    '/media/:id/file',
    asyncHandler(async (req, res) => {
      const item = media.findReady(req.params.id, userIdOf(req));
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
