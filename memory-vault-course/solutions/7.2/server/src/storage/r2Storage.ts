import type { Storage } from './types';

export interface ObjectClient {
  presignPut(key: string, options: { size: number; contentType: string }): Promise<string>;
  presignGet(key: string, options: { contentType: string; disposition: string; cacheControl: string; signingDate: Date }): Promise<string>;
  headSize(key: string): Promise<number | null>;
  getRange(key: string, start: number, end: number): Promise<Uint8Array>;
  delete(key: string): Promise<void>;
}

export interface R2Options {
  now?: () => number;
}

const HALF_HOUR = 30 * 60 * 1000;

export function createR2Storage(client: ObjectClient, options: R2Options = {}): Storage {
  const now = options.now ?? Date.now;
  return {
    direct: true,
    async uploadTarget(key, size) {
      const url = await client.presignPut(key, { size, contentType: 'application/octet-stream' });
      return { url, headers: { 'Content-Type': 'application/octet-stream' } };
    },
    head: (key) => client.headSize(key),
    readHead: (key, bytes) => client.getRange(key, 0, bytes - 1),
    remove: (key) => client.delete(key),
    getUrl(key, { mime, filename, download }) {
      return client.presignGet(key, {
        contentType: mime,
        disposition: `${download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(filename)}`,
        cacheControl: 'private, max-age=1800',
        signingDate: new Date(Math.floor(now() / HALF_HOUR) * HALF_HOUR),
      });
    },
  };
}
