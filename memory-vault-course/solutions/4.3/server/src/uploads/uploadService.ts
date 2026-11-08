import { randomBytes } from 'node:crypto';
import type { MediaKind } from '@memory-vault/shared';
import { cleanFileName, isIsoDate, sniffFileType } from '@memory-vault/shared';
import type { MediaRepo, MediaRow } from '../db/mediaRepo';
import { HttpError } from '../http/errors';
import type { Storage } from '../storage/types';

export interface UploadServiceDeps {
  media: MediaRepo;
  storage: Storage;
  maxBytes: number;
}

export class UploadService {
  constructor(private deps: UploadServiceDeps) {}

  async init(
    userId: number,
    input: { name: string; size: number; takenOn?: string },
  ): Promise<{ id: string; url: string; headers: Record<string, string> }> {
    const { media, storage, maxBytes } = this.deps;
    if (!Number.isInteger(input.size) || input.size <= 0) throw new HttpError(400, 'Empty file');
    if (input.size > maxBytes) throw new HttpError(413, 'File too large');
    const storageKey = randomBytes(24).toString('hex');
    const id = media.createPending({
      userId,
      name: cleanFileName(input.name),
      size: input.size,
      takenOn: isIsoDate(input.takenOn) ? input.takenOn : '',
      storageKey,
    });
    const target = await storage.uploadTarget(storageKey, input.size, id);
    return { id, url: target.url, headers: target.headers };
  }

  async complete(userId: number, id: string): Promise<{ id: string; kind: MediaKind }> {
    const { media, storage } = this.deps;
    const row = media.findPending(id, userId);
    if (!row) {
      const done = media.findReady(id, userId);
      if (done) return { id: done.id, kind: done.kind };
      throw new HttpError(404, 'Not found');
    }

    const size = await storage.head(row.storageKey);
    if (size === null) throw new HttpError(400, 'The file did not arrive. Please try again.');
    if (size !== row.size) {
      await this.discard(row);
      throw new HttpError(400, 'Incomplete upload');
    }

    const type = sniffFileType(await storage.readHead(row.storageKey, 64));
    if (!type) {
      await this.discard(row);
      throw new HttpError(415, 'Unsupported file type (images and videos only)');
    }
    media.markReady(row.id, type);
    return { id: row.id, kind: type.kind };
  }

  async purgeStale(maxAgeMs: number, now: number = Date.now()): Promise<number> {
    const stale = this.deps.media.listPendingOlderThan(now - maxAgeMs);
    for (const row of stale) await this.discard(row);
    return stale.length;
  }

  private async discard(row: MediaRow): Promise<void> {
    await this.deps.storage.remove(row.storageKey);
    this.deps.media.discard(row.id);
  }
}
