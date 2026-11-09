// EXERCISE 4.3: the upload routes. Make `npm run ex -- 4.3` pass.
//
// These routes connect the HTTP world to the UploadService (4.2) and the Storage (2.2).
// New idea: streaming a request body to disk (the file never sits in memory):
//     await pipeline(req, new SizeGuard(size), fs.createWriteStream(tmpPath));     // req is a readable stream
// Write to a temporary `.part` file and rename it when complete, so a crash never leaves a half file under the real name.
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

/**
 * Also fill in uploadInitSchema in validation.ts (it is still z.any()).
 *
 * POST /uploads              body validated by uploadInitSchema -> 201 with the result of uploads.init(userId, body)
 *
 * PUT  /uploads/:id/data     Only for local storage. Throw HttpError(404, 'Not found') when storage.direct is true or
 *                            storage.localPath is missing. Find the pending item (media.findPending) or 404.
 *                            The Content-Length header must equal the item's size, else HttpError(400, 'Size mismatch').
 *                            Write the body to `${path}.part` through SizeGuard (pipeline), then rename it to `path`
 *                            (path = storage.localPath(row.storageKey)). On any failure delete the .part file
 *                            (fs.promises.rm(tmp, { force: true })) and rethrow. Success: { ok: true }
 *
 * POST /uploads/:id/complete -> result of uploads.complete(userId, id)
 * userId is req.session!.userId. Use asyncHandler for async routes.
 */
export function uploadsRouter(deps: UploadsRouterDeps): Router {
  const router = Router();
  // TODO: add the three routes described above.
  return router;
}
