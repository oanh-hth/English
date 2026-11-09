// EXERCISE 4.2: the upload workflow. Make `npm run ex -- 4.2` pass.
//
// Uploading a big video is not one step, and the browser cannot be trusted, so the server does it in three:
//   init      "I want to upload beach.jpg, 4 MB."   -> record a PENDING item, say where to send the bytes
//   (the browser sends the bytes straight to that place)
//   complete  "I finished."                         -> check the file really arrived and really is an image or video,
//                                                      and only then make the item visible (READY)
// This service uses the pieces you built before: cleanFileName / isIsoDate (1.1), sniffFileType (4.1) and MediaRepo (2.1).
import { randomBytes } from 'node:crypto';
import type { MediaKind } from '@memory-vault/shared';
import { cleanFileName, isIsoDate, sniffFileType } from '@memory-vault/shared';
import type { MediaRepo, MediaRow } from '../db/mediaRepo';
import { HttpError } from '../http/errors';
import type { Storage } from '../storage/types';

export interface UploadServiceDeps {
  media: MediaRepo;
  storage: Storage;
  /** Largest file in bytes. */
  maxBytes: number;
}

export class UploadService {
  constructor(private deps: UploadServiceDeps) {}

  /**
   * Start an upload.
   *  - size must be a positive whole number, else throw new HttpError(400, 'Empty file')
   *  - size over maxBytes: throw new HttpError(413, 'File too large')
   *  - storage key: 24 random bytes as hex (48 characters)
   *  - the stored name is cleanFileName(name); takenOn is kept only when isIsoDate(takenOn), otherwise ''
   *  - create the pending item with media.createPending, ask storage.uploadTarget(key, size, id) where to send the file
   *  - return { id, url, headers } (url and headers come from the storage)
   */
  async init(
    userId: number,
    input: { name: string; size: number; takenOn?: string },
  ): Promise<{ id: string; url: string; headers: Record<string, string> }> {
    throw new Error('Not implemented: UploadService.init');
  }

  /**
   * Finish an upload.
   *  1. Find the PENDING item of this user. If there is none but a READY one exists, return it (finishing twice is fine).
   *     Otherwise throw new HttpError(404, 'Not found').
   *  2. storage.head(key) is null: the bytes never arrived. Throw new HttpError(400, 'The file did not arrive. Please try again.')
   *     and KEEP the pending item, so the browser can retry.
   *  3. The size is not the size announced in init: discard (see below) and throw new HttpError(400, 'Incomplete upload').
   *  4. Read the first 64 bytes (storage.readHead) and run sniffFileType. null means not an image or video:
   *     discard and throw new HttpError(415, 'Unsupported file type (images and videos only)').
   *  5. Otherwise media.markReady(id, type) and return { id, kind }.
   * "Discard" = delete the file from storage AND delete the row (media.discard).
   */
  async complete(userId: number, id: string): Promise<{ id: string; kind: MediaKind }> {
    throw new Error('Not implemented: UploadService.complete');
  }

  /**
   * Remove abandoned uploads: pending items older than maxAgeMs (compared with `now`). Discard each one and
   * return how many were removed. Fresh pending items stay.
   */
  async purgeStale(maxAgeMs: number, now: number = Date.now()): Promise<number> {
    throw new Error('Not implemented: UploadService.purgeStale');
  }
}
