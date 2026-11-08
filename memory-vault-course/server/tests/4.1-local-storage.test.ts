import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createLocalStorage } from '../src/storage/localStorage';

let dir: string;
beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vault-storage-')); });
afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

const KEY = 'abcdef0123456789';

describe('4.1 createLocalStorage', () => {
  it('creates the folder when it is missing', () => {
    const nested = path.join(dir, 'a', 'b');
    createLocalStorage(nested);
    expect(fs.existsSync(nested)).toBe(true);
  });

  it('says uploads go to this server', async () => {
    const storage = createLocalStorage(dir);
    expect(storage.direct).toBe(false);
    expect(await storage.uploadTarget(KEY, 10, 'up1')).toEqual({ url: '/api/uploads/up1/data', headers: {} });
    expect(await storage.getUrl(KEY, { mime: 'image/png', filename: 'a.png', download: false })).toBeNull();
  });

  it('maps a key to a path inside the folder', () => {
    const storage = createLocalStorage(dir);
    expect(storage.localPath(KEY)).toBe(path.join(dir, KEY));
  });

  it('refuses keys that could escape the folder', () => {
    const storage = createLocalStorage(dir);
    for (const bad of ['../secret', 'a/b/c/d/e/f/g/h', '..', '', 'short', 'has space in it', 'x'.repeat(200)]) {
      expect(() => storage.localPath(bad), bad).toThrow('Invalid storage key');
    }
  });

  it('head returns the size, or null for a missing file', async () => {
    const storage = createLocalStorage(dir);
    expect(await storage.head(KEY)).toBeNull();
    fs.writeFileSync(path.join(dir, KEY), Buffer.alloc(1234));
    expect(await storage.head(KEY)).toBe(1234);
  });

  it('readHead returns the first bytes, or fewer when the file is short', async () => {
    const storage = createLocalStorage(dir);
    fs.writeFileSync(path.join(dir, KEY), Buffer.from('0123456789'));
    expect(Buffer.from(await storage.readHead(KEY, 4)).toString()).toBe('0123');
    expect(Buffer.from(await storage.readHead(KEY, 64)).toString()).toBe('0123456789');
  });

  it('remove deletes the file and is happy when it is already gone', async () => {
    const storage = createLocalStorage(dir);
    fs.writeFileSync(path.join(dir, KEY), 'x');
    await storage.remove(KEY);
    expect(fs.existsSync(path.join(dir, KEY))).toBe(false);
    await expect(storage.remove(KEY)).resolves.toBeUndefined();
  });
});
