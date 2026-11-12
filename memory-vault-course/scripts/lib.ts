import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const rel = (p: string) => path.relative(root, p).split(path.sep).join('/');

export interface FileResult { name: string; status: string; tests: number }

/** Run the whole test suite once and return the result of every test file (does not stop on failures). */
export function runAllTests(extraArgs: string[] = []): Map<string, FileResult> {
  const out = path.join(root, '.progress', 'results.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.rmSync(out, { force: true });
  spawnSync('npx', ['vitest', 'run', '--reporter=json', `--outputFile=${out}`, ...extraArgs], { cwd: root, stdio: 'ignore' });
  const results = new Map<string, FileResult>();
  if (!fs.existsSync(out)) return results;
  const json = JSON.parse(fs.readFileSync(out, 'utf8'));
  for (const file of json.testResults ?? []) {
    const name = rel(file.name);
    results.set(name, { name, status: file.status, tests: (file.assertionResults ?? []).length });
  }
  return results;
}

export function filePassed(results: Map<string, FileResult>, testFile: string): boolean {
  const r = results.get(testFile);
  return !!r && r.status === 'passed' && r.tests > 0;
}
