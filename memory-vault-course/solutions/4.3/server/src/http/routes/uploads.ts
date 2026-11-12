import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Router } from 'express';
import type { MediaRepo } from '../../db/mediaRepo';
import type { Storage } from '../../storage/types';
import type { UploadService } from '../../uploads/uploadService';
import { asyncHandler, HttpError } from '../errors';
import { SizeGuard } from '../sizeGuard';
import { parseBody, uploadInitSchema } from '../validation';

export interface UploadsRouterDeps {
  uploads: UploadService;
  media: MediaRepo;
  storage: Storage;
}

export function uploadsRouter({ uploads, media, storage }: UploadsRouterDeps): Router {
  const router = Router();

  router.post(
    '/uploads',
    asyncHandler(async (req, res) => {
      const body = parseBody(uploadInitSchema, req.body);
      res.status(201).json(await uploads.init(req.session!.userId, body));
    }),
  );

  router.put(
    '/uploads/:id/data',
    asyncHandler(async (req, res) => {
      if (storage.direct || !storage.localPath) throw new HttpError(404, 'Not found');
      const row = media.findPending(req.params.id, req.session!.userId);
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
      res.json(await uploads.complete(req.session!.userId, req.params.id));
    }),
  );

  return router;
}
