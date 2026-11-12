// Given: a fake storage that keeps files in a Map. It behaves like a cloud bucket (direct = true) and lets tests
// "upload" by calling put().
import type { Storage } from '../src/storage/types';

export interface MemoryStorage extends Storage {
  put(key: string, bytes: Uint8Array): void;
  has(key: string): boolean;
  keys(): string[];
}

export function createMemoryStorage(): MemoryStorage {
  const files = new Map<string, Uint8Array>();
  return {
    direct: true,
    put: (key, bytes) => void files.set(key, bytes),
    has: (key) => files.has(key),
    keys: () => [...files.keys()],
    async uploadTarget(key) {
      return { url: `memory://upload/${key}`, headers: { 'Content-Type': 'application/octet-stream' } };
    },
    async head(key) {
      return files.get(key)?.length ?? null;
    },
    async readHead(key, bytes) {
      return (files.get(key) ?? new Uint8Array()).slice(0, bytes);
    },
    async remove(key) {
      files.delete(key);
    },
    async getUrl(key, { mime, filename, download }) {
      return `memory://view/${key}?type=${encodeURIComponent(mime)}&name=${encodeURIComponent(filename)}&download=${download}`;
    },
  };
}
