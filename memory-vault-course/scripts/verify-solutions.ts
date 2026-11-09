// For maintainers: put every reference solution in place, run all tests, then restore the learner stubs.
// Anything that fails here is a bug in the course, not in the learner's code.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { allExercises as everyExercise } from '../course/curriculum';
import { filePassed, root, runAllTests } from './lib';

// `npm run verify:solutions` checks the finished course. `npm run verify:solutions -- --through=3` pretends the learner
// finished parts 1 to 3 only: those exercises must pass, and the whole project must still compile with the later stubs.
const arg = process.argv.find((a) => a.startsWith('--through='));
const through = arg ? Number(arg.split('=')[1]) : 99;
const allExercises = everyExercise.filter((e) => Number(e.id.split('.')[0]) <= through);
const backup = path.join(root, '.solutions-backup');
const touched: { target: string; had: boolean }[] = [];

function walk(d: string): string[] {
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
}

function restore() {
  for (const t of touched) {
    const b = path.join(backup, t.target);
    if (t.had) fs.copyFileSync(b, path.join(root, t.target));
    else fs.rmSync(path.join(root, t.target), { force: true });
  }
  fs.rmSync(backup, { recursive: true, force: true });
}

fs.rmSync(backup, { recursive: true, force: true });
let failed = 0;
try {
  for (const ex of allExercises) {
    const dir = path.join(root, 'solutions', ex.id);
    for (const file of walk(dir)) {
      const target = path.relative(dir, file);
      const dest = path.join(root, target);
      // A file can be replaced by several solutions (it grows over the course). Back it up only the FIRST time.
      if (!touched.some((t) => t.target === target)) {
        const had = fs.existsSync(dest);
        if (had) { fs.mkdirSync(path.dirname(path.join(backup, target)), { recursive: true }); fs.copyFileSync(dest, path.join(backup, target)); }
        touched.push({ target, had });
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(file, dest);
    }
  }
  if (arg) {
    const tsc = spawnSync('npm', ['run', 'typecheck'], { cwd: root, encoding: 'utf8' });
    console.log(`${tsc.status === 0 ? 'PASS' : 'FAIL'}  typecheck (parts 1-${through} solved, later parts still stubs)`);
    if (tsc.status !== 0) { failed++; console.log(tsc.stdout.split('\n').slice(-12).join('\n')); }
  }
  const results = runAllTests();
  for (const ex of allExercises) {
    const ok = ex.tests.every((t) => filePassed(results, t));
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${ex.id} ${ex.title}`);
    if (!ok) failed++;
  }
} finally {
  restore();
}
console.log(failed ? `\n${failed} check(s) fail with the reference solutions.` : '\nAll reference solutions pass. Stubs restored.');
process.exit(failed ? 1 : 0);
