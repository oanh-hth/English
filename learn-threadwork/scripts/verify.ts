// npm run verify: checks the course itself (for whoever maintains it).
// 1. Every reference solution passes its tests.  2. Every starter fails at least one test.  3. Manifest files exist.
import { existsSync } from "node:fs";
import path from "node:path";
import { course, runTests, root, c } from "./course";

let ok = true;
const fail = (msg: string) => { ok = false; console.log(c.red("✘ " + msg)); };

for (const e of course.exercises) {
  for (const f of [e.test, e.lesson, ...e.files]) if (!existsSync(path.join(root, f))) fail(`${e.id}: missing ${f}`);
  for (const f of e.files) if (!existsSync(path.join(root, f.replace(/^app\//, "solutions/")))) fail(`${e.id}: no solution for ${f}`);
}

console.log(c.dim("Running tests against the solutions…"));
const sol = runTests({ SOLUTIONS: "1" });
for (const e of course.exercises) {
  const r = sol.get(e.test);
  if (!r || r.failed > 0 || r.passed === 0) fail(`${e.id}: solution does not pass (${r ? `${r.passed} passed, ${r.failed} failed` : "no results"})`);
}
console.log(c.dim("Running tests against the starters…"));
const start = runTests();
for (const e of course.exercises) {
  const r = start.get(e.test);
  if (r && r.failed === 0) fail(`${e.id}: the starter already passes every test`);
}

if (ok) console.log(c.green(`✔ ${course.exercises.length} exercises: solutions pass, starters fail, files present.`));
process.exit(ok ? 0 : 1);
