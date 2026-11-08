/**
 * Maintainer check (learners can ignore this):
 *   1. every exercise starts RED: at least one test fails against the starter code;
 *   2. with the reference solutions copied over the starter, the type check, ALL tests and the build pass.
 * Run it with: npm run verify
 */
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const bin = (name: string) => join(root, 'node_modules', '.bin', name);
const skip = new Set(['node_modules', '.git', '.learn', 'dist', 'data']);

function run(cwd: string, cmd: string, args: string[]) {
  return spawnSync(cmd, args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

interface Suite { name: string; status: string; assertionResults: { status: string }[] }

function exerciseResults(cwd: string): Map<string, { passed: number; failed: number }> {
  const out = join(tmpdir(), `ca-results-${process.pid}.json`);
  run(cwd, bin('vitest'), ['run', '--reporter=json', `--outputFile=${out}`]);
  const json = JSON.parse(readFileSync(out, 'utf8')) as { testResults: Suite[] };
  const byExercise = new Map<string, { passed: number; failed: number }>();
  for (const suite of json.testResults) {
    const match = suite.name.split(sep).join('/').match(/exercises\/[^/]+\/(\d+\.\d+)-/);
    if (!match) continue;
    const entry = byExercise.get(match[1]) ?? { passed: 0, failed: 0 };
    for (const a of suite.assertionResults) a.status === 'passed' ? entry.passed++ : entry.failed++;
    if (suite.assertionResults.length === 0 && suite.status !== 'passed') entry.failed++;
    byExercise.set(match[1], entry);
  }
  return byExercise;
}

let ok = true;
const fail = (message: string) => { ok = false; console.error(`  FAIL ${message}`); };

console.log('1/2  Starter code: every exercise should start red');
for (const [id, r] of [...exerciseResults(root)].sort()) {
  if (r.failed === 0) fail(`exercise ${id} already passes with the starter code (${r.passed} tests)`);
  else console.log(`  ok   ${id} starts red (${r.failed} failing of ${r.failed + r.passed})`);
}

console.log('2/2  Reference solutions: everything should be green');
const work = mkdtempSync(join(tmpdir(), 'ca-verify-'));
try {
  cpSync(root, work, { recursive: true, filter: (src) => !skip.has(src.slice(root.length + 1).split(sep)[0]) });
  symlinkSync(join(root, 'node_modules'), join(work, 'node_modules'), 'dir');
  if (existsSync(join(work, 'solutions'))) cpSync(join(work, 'solutions'), work, { recursive: true });
  const checks: [string, string[]][] = [
    ['type check', [bin('tsc'), '--noEmit']],
    ['all tests', [bin('vitest'), 'run']],
    ['client build', [bin('vite'), 'build']],
  ];
  for (const [label, [cmd, ...args]] of checks) {
    const r = run(work, cmd, args);
    if (r.status === 0) console.log(`  ok   ${label}`);
    else { fail(label); console.error((r.stdout + r.stderr).split('\n').slice(-40).join('\n')); }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log(ok ? '\nAll checks passed.' : '\nSome checks failed.');
process.exit(ok ? 0 : 1);
