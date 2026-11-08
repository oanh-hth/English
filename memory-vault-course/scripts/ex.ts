// npm run ex -- 2.1          run the tests of one exercise
// npm run ex -- 2.1 --watch  re-run on every save
import { spawnSync } from 'node:child_process';
import { findExercise } from '../course/curriculum';
import { root } from './lib';

const [id, flag] = process.argv.slice(2);
const ex = id ? findExercise(id) : undefined;
if (!ex) {
  console.error('Usage: npm run ex -- <exercise id> [--watch]   (for example: npm run ex -- 1.2)');
  process.exit(1);
}
console.log(`\nExercise ${ex.id}: ${ex.title}\nBuilds: ${ex.feature}\nEdit:   ${ex.files.join(', ') || '(nothing: make the earlier exercises pass)'}\n`);
const args = ['vitest', flag === '--watch' ? 'watch' : 'run', ...ex.tests];
const r = spawnSync('npx', args, { cwd: root, stdio: 'inherit' });
process.exit(r.status ?? 1);
