import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Item } from '../domain/types';

/**
 * Read the items saved in a JSON file.
 *  - the file does not exist yet: return []  (first run)
 *  - the file exists but is not a JSON array: throw an Error (do not silently lose the user's data)
 */
export async function loadItems(path: string): Promise<Item[]> {
  // TODO: Wrap readFile in try/catch and only swallow the ENOENT error code (error.code ===
  //       'ENOENT'). Everything else must be re-thrown.
  throw new Error('Not implemented yet');
}

/**
 * Save the items as pretty JSON, creating missing folders.
 * Write to `<path>.tmp` first and then rename: a crash in the middle can never leave a half-written file.
 */
export async function saveItems(path: string, items: readonly Item[]): Promise<void> {
  // TODO: mkdir with { recursive: true }, writeFile to the temp name, then rename over the real
  //       file.
  throw new Error('Not implemented yet');
}
