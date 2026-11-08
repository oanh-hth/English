// EXERCISE 4.1: store files on disk. Make `npm run ex -- 4.1` pass.
//
// Node's `fs.promises` API reads and writes files without blocking the server. Remember to `await` every call.
//   import fs from 'node:fs/promises';
//   await fs.stat(path)        // { size, ... }; throws an error with err.code === 'ENOENT' when the file does not exist
//   await fs.open(path, 'r')   // a file handle: handle.read(buffer, 0, length, position) then handle.close()
//   await fs.unlink(path)      // delete a file
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import type { Storage } from './types';

export interface LocalStorage extends Storage {
  localPath(key: string): string;
}

/**
 * Build a storage that keeps each file in `dir`, named by its key.
 *
 * - Create `dir` if it does not exist (fsSync.mkdirSync(dir, { recursive: true })).
 * - localPath(key): path.join(dir, key). A key may only contain letters, digits, "-" and "_" and be 8 to 128 characters long.
 *   Anything else (such as "../secret" or "a/b") must throw new Error('Invalid storage key').
 *   WHY: keys come from our own code today, but "never trust a path" is the habit that prevents directory-traversal attacks.
 * - direct: false (the browser uploads to our server)
 * - uploadTarget(key, size, uploadId): { url: `/api/uploads/${uploadId}/data`, headers: {} }
 * - head(key): the file size, or null when the file does not exist (other errors are still thrown)
 * - readHead(key, n): the first n bytes. A file shorter than n gives fewer bytes.
 * - remove(key): delete the file; do nothing when it is already gone
 * - getUrl(): always null, because this server streams local files itself
 */
export function createLocalStorage(dir: string): LocalStorage {
  throw new Error('Not implemented: createLocalStorage');
}
