// npm run solution -- 2.1            list the reference solution files
// npm run solution -- 2.1 --show     print them
// npm run solution -- 2.1 --apply    copy them over your files (this REPLACES your work: try first, peek second)
import fs from 'node:fs';
import path from 'node:path';
import { findExercise } from '../course/curriculum';
import { root } from './lib';

const [id, flag] = process.argv.slice(2);
if (!id || !findExercise(id)) { console.error('Usage: npm run solution -- <exercise id> [--show|--apply]'); process.exit(1); }
const dir = path.join(root, 'solutions', id);
if (!fs.existsSync(dir)) { console.log(`Exercise ${id} has no solution files (nothing to write).`); process.exit(0); }

function walk(d: string): string[] {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
}
for (const file of walk(dir)) {
  const target = path.relative(dir, file);
  if (flag === '--show') console.log(`\n// ===== ${target} =====\n${fs.readFileSync(file, 'utf8')}`);
  else if (flag === '--apply') { fs.mkdirSync(path.dirname(path.join(root, target)), { recursive: true }); fs.copyFileSync(file, path.join(root, target)); console.log(`Replaced ${target}`); }
  else console.log(target);
}
