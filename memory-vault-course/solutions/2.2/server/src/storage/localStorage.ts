import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import type { Storage } from './types';

export interface LocalStorage extends Storage {
  localPath(key: string): string;
}

const KEY_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
const isMissing = (error: unknown) => (error as NodeJS.ErrnoException).code === 'ENOENT';

export function createLocalStorage(dir: string): LocalStorage {
  fsSync.mkdirSync(dir, { recursive: true });

  const localPath = (key: string) => {
    if (!KEY_PATTERN.test(key)) throw new Error('Invalid storage key');
    return path.join(dir, key);
  };

  return {
    direct: false,
    localPath,
    async uploadTarget(_key, _size, uploadId) {
      return { url: `/api/uploads/${uploadId}/data`, headers: {} };
    },
    async head(key) {
      try {
        return (await fs.stat(localPath(key))).size;
      } catch (error) {
        if (isMissing(error)) return null;
        throw error;
      }
    },
    async readHead(key, bytes) {
      const handle = await fs.open(localPath(key), 'r');
      try {
        const buffer = Buffer.alloc(bytes);
        const { bytesRead } = await handle.read(buffer, 0, bytes, 0);
        return buffer.subarray(0, bytesRead);
      } finally {
        await handle.close();
      }
    },
    async remove(key) {
      try {
        await fs.unlink(localPath(key));
      } catch (error) {
        if (!isMissing(error)) throw error;
      }
    },
    async getUrl() {
      return null;
    },
  };
}
