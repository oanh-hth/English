// EXERCISE 5.3: upload and file routes. Make `npm run ex -- 5.3` pass.
//
// These routes connect the HTTP world to the UploadService (4.3), the Storage (4.1) and parseRange (4.2).
// New ideas: streaming a request body to disk (the file never sits in memory), and answering with a slice of a file.
//
//   Streams:   await pipeline(req, new SizeGuard(size), fs.createWriteStream(tmpPath));   // req is a readable stream
//   Redirect:  res.redirect(302, url)
//   Headers:   res.set({ 'Content-Type': '...', 'Accept-Ranges': 'bytes' })      res.status(206)
//   Send file: fs.createReadStream(path, { start, end }).pipe(res)       (start and end are both included)
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Router } from 'express';
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

/**
 * Routes to build (userId is req.session!.userId):
 *
 *  POST /uploads              body validated by uploadInitSchema -> 201 with the result of uploads.init(userId, body)
 *
 *  PUT  /uploads/:id/data     Only for local storage. Throw HttpError(404, 'Not found') when storage.direct is true or
 *                             storage.localPath is missing. Find the pending item (media.findPending) or 404.
 *                             The Content-Length header must equal the item's size, else HttpError(400, 'Size mismatch').
 *                             Write the body to `${path}.part` through SizeGuard (pipeline), then rename it to `path`
 *                             (path = storage.localPath(row.storageKey)). On any failure delete the .part file
 *                             (fs.promises.rm(tmp, { force: true })) and rethrow. Success: { ok: true }
 *
 *  POST /uploads/:id/complete -> result of uploads.complete(userId, id)
 *
 *  GET  /media/:id/file       Serve the ORIGINAL file of a ready item. Not found (or not yours): 404 with no body.
 *      filename = item.originalName with \r, \n and " replaced by _.   download = req.query.download === '1'
 *      1. url = await storage.getUrl(key, { mime, filename, download }). If it is a string: res.redirect(302, url).
 *      2. Otherwise stream from disk. size = await storage.head(key) (null -> 404). range = parseRange(req.headers.range, size).
 *         status 416: respond 416 with header "Content-Range: bytes */size" (no space before the slash) and no body.
 *         Otherwise respond with range.status and these headers:
 *           Content-Type: item.mime
 *           Content-Disposition: `${download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(filename)}`
 *           Accept-Ranges: bytes
 *           Content-Length: end - start + 1
 *           Cache-Control: private, no-cache
 *           and for 206 only: Content-Range: `bytes ${start}-${end}/${size}`
 *         Then pipe fs.createReadStream(storage.localPath(key), { start, end }) into res.
 */
export function uploadsRouter(deps: UploadsRouterDeps): Router {
  const router = Router();
  // TODO: add the routes described above.
  return router;
}
