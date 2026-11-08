// npm run ex <id>      work on one exercise: shows what to do and runs its tests in watch mode
// npm run ex <id> --once   run the tests once
// npm run ex next      the first exercise that is not finished yet
import { spawnSync } from "node:child_process";
import path from "node:path";
import { course, runTests, root, c } from "./course";

const args = process.argv.slice(2);
let id = args.find(a => !a.startsWith("-"));
const once = args.includes("--once");

if (!id) {
  console.log("Usage: npm run ex <exercise id>   e.g. npm run ex 1.2\n       npm run ex next\n\nExercises:");
  for (const e of course.exercises) console.log(`  ${e.id.padEnd(4)} ${e.title}`);
  process.exit(0);
}
if (id === "next") {
  console.log(c.dim("Finding the next unfinished exercise…"));
  const results = runTests();
  const e = course.exercises.find(x => { const r = results.get(x.test); return !r || r.failed > 0 || r.passed === 0; });
  if (!e) { console.log(c.green("Every exercise passes. Look at curriculum/capstone.md.")); process.exit(0); }
  id = e.id;
}
const ex = course.exercises.find(e => e.id === id);
if (!ex) { console.error(c.red(`No exercise "${id}". Run npm run ex to see the list.`)); process.exit(1); }

console.log(`\n${c.bold(`Exercise ${ex.id}: ${ex.title}`)}`);
console.log(`  Lesson:   ${ex.lesson}`);
console.log(`  Edit:     ${ex.files.join(", ")}`);
console.log(`  Tests:    ${ex.test}`);
console.log(c.dim(once ? "" : "  Watching: save a file and the tests run again. Press q to quit.\n"));

const r = spawnSync(process.execPath, [path.join(root, "node_modules/vitest/vitest.mjs"), once ? "run" : "watch", ex.test], { cwd: root, stdio: "inherit" });
process.exit(r.status ?? 0);
