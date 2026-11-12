// EXERCISE 2.4 (part 2 of 2): serve the original files. Make `npm run ex -- 2.4` pass.
//
// New ideas: answering with a FILE instead of JSON, streaming (the file never sits in memory), and HTTP byte ranges
// (your parseRange from exercise 2.3) so a video can jump to minute 40 without downloading minutes 1 to 39.
//
//   Headers:   res.set({ 'Content-Type': '...', 'Accept-Ranges': 'bytes' })      res.status(206)
//   Redirect:  res.redirect(302, url)
//   Send file: fs.createReadStream(path, { start, end }).pipe(res)       (start and end are both included)
//   Async routes must be wrapped: asyncHandler(async (req, res) => { ... })
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

/**
 * GET /media/:id/file   Serve the ORIGINAL file of a ready item of the signed-in user.
 *   Unknown id, not yours, or not ready: 404 with no body (answer the same for "not yours" as for "does not exist").
 *   filename = item.originalName with \r, \n and " replaced by _.   download = req.query.download === '1'
 *   1. url = await storage.getUrl(item.storageKey, { mime: item.mime, filename, download }).
 *      If it is a string (cloud storage): res.redirect(302, url) and stop.
 *   2. Otherwise stream from disk. size = await storage.head(key) (null: 404). range = parseRange(req.headers.range, size).
 *      status 416: respond 416 with the header Content-Range set to `bytes ` + a star + `/` + the size, and no body.
 *      Otherwise respond with range.status and these headers:
 *        Content-Type: item.mime
 *        Content-Disposition: `${download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(filename)}`
 *        Accept-Ranges: bytes
 *        Content-Length: end - start + 1
 *        Cache-Control: private, no-cache
 *        and for 206 only: Content-Range: `bytes ${start}-${end}/${size}`
 *      Then pipe fs.createReadStream(storage.localPath(key), { start, end }) into res.
 */
export function filesRouter(deps: FilesRouterDeps): Router {
  const router = Router();
  // TODO: add the route described above.
  return router;
}
