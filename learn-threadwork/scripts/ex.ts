// npm run ex <id>           show the exercise and run its tests on every save
// npm run ex <id> -- --once run the tests once
// npm run ex next           the first exercise that isn't done
import { spawnSync } from "node:child_process";
import path from "node:path";
import { course, runTests, root, c, statusOf } from "./course";

const args = process.argv.slice(2);
let id = args.find(a => !a.startsWith("-"));
const once = args.includes("--once");

if (!id) {
  console.log("Usage: npm run ex <exercise>   e.g. npm run ex 1.2\n       npm run ex next\n");
  for (const p of course.parts) {
    console.log(c.bold(`Part ${p.id}: ${p.title}`));
    for (const e of course.exercises.filter(x => x.part === p.id)) console.log(`  ${e.id.padEnd(4)} ${e.title}${e.manual ? c.dim("  (no tests)") : ""}`);
  }
  process.exit(0);
}
if (id === "next") {
  console.log(c.dim("Finding the next exercise…"));
  const results = runTests();
  const e = course.exercises.find(x => !statusOf(x, results).done);
  if (!e) { console.log(c.green("Every exercise is done.")); process.exit(0); }
  id = e.id;
}
const ex = course.exercises.find(e => e.id === id);
if (!ex) { console.error(c.red(`No exercise "${id}". Run npm run ex to see the list.`)); process.exit(1); }
const part = course.parts.find(p => p.id === ex.part)!;
const sec = part.sections.find(s => s.id === ex.section)!;

console.log(`\n${c.bold(`Exercise ${ex.id}: ${ex.title}`)}`);
console.log(`  Part ${part.id}${sec.id}: ${sec.title}`);
console.log(`  Read:  ${ex.lesson} (the exercise is at the end)`);
if (ex.files.length) console.log(`  Edit:  ${ex.files.join(", ")}`);
if (ex.manual) {
  console.log(`\n  This exercise has no tests. When it's done, tick its box in ${ex.lesson}:  - [x] **${ex.id}**`);
  process.exit(0);
}
console.log(`  Tests: ${ex.test}`);
console.log(c.dim(once ? "" : "  Watching: save a file and the tests run again. Press q to quit.\n"));
const r = spawnSync(process.execPath, [path.join(root, "node_modules/vitest/vitest.mjs"), once ? "run" : "watch", ex.test!], { cwd: root, stdio: "inherit" });
process.exit(r.status ?? 0);
