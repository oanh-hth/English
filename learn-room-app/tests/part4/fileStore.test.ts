import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadItems, saveItems } from '@/server/fileStore';
import { item } from '../helpers';

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'room-'));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('loadItems', () => {
  it('returns [] when the file does not exist yet', async () => {
    expect(await loadItems(join(dir, 'missing.json'))).toEqual([]);
  });

  it('reads items from the file', async () => {
    const a = item({ name: 'A' });
    await writeFile(join(dir, 'items.json'), JSON.stringify([a]));
    expect(await loadItems(join(dir, 'items.json'))).toEqual([a]);
  });

  it('throws on broken JSON instead of pretending the room is empty', async () => {
    await writeFile(join(dir, 'items.json'), '{ not json');
    await expect(loadItems(join(dir, 'items.json'))).rejects.toThrow();
  });

  it('throws when the file holds something other than a list', async () => {
    await writeFile(join(dir, 'items.json'), '{"a":1}');
    await expect(loadItems(join(dir, 'items.json'))).rejects.toThrow('does not contain a list of items');
  });

  it('does not hide other errors such as reading a directory', async () => {
    await expect(loadItems(dir)).rejects.toThrow();
  });
});

describe('saveItems', () => {
  it('writes readable JSON that loadItems can read back', async () => {
    const items = [item({ name: 'Sữa' }), item({ name: 'Gạo' })];
    const path = join(dir, 'items.json');
    await saveItems(path, items);
    expect(await loadItems(path)).toEqual(items);
    expect(await readFile(path, 'utf8')).toContain('\n  ');
  });

  it('creates missing folders', async () => {
    const path = join(dir, 'a', 'b', 'items.json');
    await saveItems(path, []);
    expect(await loadItems(path)).toEqual([]);
  });

  it('leaves no temp file behind', async () => {
    await saveItems(join(dir, 'items.json'), [item()]);
    expect(await readdir(dir)).toEqual(['items.json']);
  });

  it('replaces the previous content', async () => {
    const path = join(dir, 'items.json');
    await saveItems(path, [item(), item()]);
    await saveItems(path, [item()]);
    expect(await loadItems(path)).toHaveLength(1);
  });
});
