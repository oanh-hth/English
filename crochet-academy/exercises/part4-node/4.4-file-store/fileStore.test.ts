import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPersistentRepository, loadCharts, saveCharts } from '@/server/fileStore';
import { chart, row, st } from '../../_helpers/fixtures';

let dir: string;
beforeEach(async () => { dir = await mkdtemp(join(tmpdir(), 'academy-')); });
afterEach(async () => { await rm(dir, { recursive: true, force: true }); vi.restoreAllMocks(); });

const input = (name: string) => ({ name, mode: 'flat' as const, rows: [row('r', [st('sc', 3)])] });

describe('4.4 loadCharts', () => {
  it('returns [] when the file does not exist', async () => {
    expect(await loadCharts(join(dir, 'missing.json'))).toEqual([]);
  });

  it('reads charts back', async () => {
    const file = join(dir, 'charts.json');
    await writeFile(file, JSON.stringify([chart([], 'flat', 'A')]));
    expect((await loadCharts(file)).map((c) => c.name)).toEqual(['A']);
  });

  it('throws a helpful error for broken JSON or the wrong shape', async () => {
    const file = join(dir, 'bad.json');
    await writeFile(file, '{ nope');
    await expect(loadCharts(file)).rejects.toThrow(file);
    await writeFile(file, '{"not":"a list"}');
    await expect(loadCharts(file)).rejects.toThrow(file);
  });
});

describe('4.4 saveCharts', () => {
  it('round-trips with loadCharts', async () => {
    const file = join(dir, 'charts.json');
    const charts = [chart([row('a', [st('sc')])], 'round', 'Coaster')];
    await saveCharts(file, charts);
    expect(await loadCharts(file)).toEqual(charts);
  });

  it('creates missing folders', async () => {
    const file = join(dir, 'deep', 'er', 'charts.json');
    await saveCharts(file, []);
    expect(await loadCharts(file)).toEqual([]);
  });

  it('writes readable, indented JSON', async () => {
    const file = join(dir, 'charts.json');
    await saveCharts(file, [chart([], 'flat', 'A')]);
    expect(await readFile(file, 'utf8')).toContain('\n  ');
  });

  it('leaves no temporary file behind', async () => {
    await saveCharts(join(dir, 'charts.json'), []);
    expect(await readdir(dir)).toEqual(['charts.json']);
  });
});

describe('4.4 createPersistentRepository', () => {
  it('starts with what is on disk', async () => {
    const file = join(dir, 'charts.json');
    await saveCharts(file, [chart([], 'flat', 'Existing')]);
    const { repo } = await createPersistentRepository(file);
    expect(repo.list().map((c) => c.name)).toEqual(['Existing']);
  });

  it('saves after every change and survives a "restart"', async () => {
    const file = join(dir, 'charts.json');
    const first = await createPersistentRepository(file);
    const a = first.repo.create(input('A'));
    first.repo.create(input('B'));
    first.repo.update(a.id, input('A2'));
    await first.whenSaved();
    const second = await createPersistentRepository(file);
    expect(second.repo.list().map((c) => c.name).sort()).toEqual(['A2', 'B']);
    second.repo.remove(a.id);
    await second.whenSaved();
    expect((await loadCharts(file)).map((c) => c.name)).toEqual(['B']);
  });

  it('keeps the LAST state even when many changes happen at once', async () => {
    const file = join(dir, 'charts.json');
    const { repo, whenSaved } = await createPersistentRepository(file);
    for (let i = 0; i < 25; i++) repo.create(input(`chart ${i}`));
    await whenSaved();
    expect(await loadCharts(file)).toHaveLength(25);
  });

  it('reports a failed save and keeps working', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const file = join(dir, 'charts.json');
    const { repo, whenSaved } = await createPersistentRepository(file);
    await writeFile(`${file}.tmp`, 'x');
    // make the first save fail by putting a directory where the file should go
    const { mkdir } = await import('node:fs/promises');
    await rm(`${file}.tmp`);
    await mkdir(file);
    repo.create(input('lost'));
    await expect(whenSaved()).resolves.toBeUndefined();
    expect(error).toHaveBeenCalled();
    await rm(file, { recursive: true });
    repo.create(input('kept'));
    await whenSaved();
    expect((await loadCharts(file)).map((c) => c.name).sort()).toEqual(['kept', 'lost']);
  });
});
