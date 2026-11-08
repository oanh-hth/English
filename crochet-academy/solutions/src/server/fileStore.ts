import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Chart } from '@/shared/types';
import { ChartRepository } from './repository';

export async function loadCharts(file: string): Promise<Chart[]> {
  let text: string;
  try {
    text = await readFile(file, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  try {
    const data: unknown = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error('expected a list of charts');
    return data as Chart[];
  } catch (error) {
    throw new Error(`Could not read ${file}: ${(error as Error).message}`);
  }
}

export async function saveCharts(file: string, charts: Chart[]): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  await writeFile(temp, JSON.stringify(charts, null, 2), 'utf8');
  await rename(temp, file);
}

export async function createPersistentRepository(file: string): Promise<{ repo: ChartRepository; whenSaved: () => Promise<void> }> {
  const initial = await loadCharts(file);
  let queue: Promise<void> = Promise.resolve();
  const repo = new ChartRepository({
    initial,
    onChange: (charts) => {
      queue = queue.then(() => saveCharts(file, charts)).catch((error) => console.error('Could not save charts:', error));
    },
  });
  return { repo, whenSaved: () => queue };
}
