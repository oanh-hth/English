import { todo } from '@/shared/todo';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Chart } from '@/shared/types';
import { ChartRepository } from './repository';

/**
 * Exercise 4.4: keep charts on disk so they survive a restart.
 *
 * loadCharts(file)
 *   - a missing file is fine: return []
 *   - invalid JSON, or JSON that is not an array: throw an Error whose message contains the file path
 *
 * saveCharts(file, charts)
 *   - create the parent folder if needed (mkdir recursive)
 *   - write pretty JSON (2 spaces) to `${file}.tmp`, then rename it over `file`.
 *     Renaming is atomic: a crash halfway never leaves a half-written data file.
 *
 * createPersistentRepository(file)
 *   - load the charts, build a ChartRepository with them as `initial`
 *   - onChange saves the list. Saves must run ONE AT A TIME, in order (chain them on a promise), so a slow
 *     early write can never overwrite a later one.
 *   - a failed save is reported with console.error and must not stop later saves.
 *   - whenSaved() returns a promise that resolves once every save requested so far has finished.
 */
export async function loadCharts(file: string): Promise<Chart[]> {
  // TODO(4.4)
  return todo('4.4');
}

export async function saveCharts(file: string, charts: Chart[]): Promise<void> {
  // TODO(4.4)
  return todo('4.4');
}

export async function createPersistentRepository(file: string): Promise<{ repo: ChartRepository; whenSaved: () => Promise<void> }> {
  // TODO(4.4)
  return todo('4.4');
}
