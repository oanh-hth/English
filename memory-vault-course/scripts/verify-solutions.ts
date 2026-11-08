// For maintainers: put every reference solution in place, run all tests, then restore the learner stubs.
// Anything that fails here is a bug in the course, not in the learner's code.
import fs from 'node:fs';
import path from 'node:path';
import { allExercises } from '../course/curriculum';
import { filePassed, root, runAllTests } from './lib';

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
      const had = fs.existsSync(dest);
      if (had) { fs.mkdirSync(path.dirname(path.join(backup, target)), { recursive: true }); fs.copyFileSync(dest, path.join(backup, target)); }
      touched.push({ target, had });
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(file, dest);
    }
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
console.log(failed ? `\n${failed} exercise(s) fail with the reference solutions.` : '\nAll reference solutions pass. Stubs restored.');
process.exit(failed ? 1 : 0);
