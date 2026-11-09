// npm run verify: checks the course itself (for whoever maintains it).
// Every solution passes, every starter fails at least one test, and every file the course mentions exists.
import { existsSync } from "node:fs";
import path from "node:path";
import { course, runTests, root, c } from "./course";

let ok = true;
const fail = (msg: string) => { ok = false; console.log(c.red("✘ " + msg)); };

for (const p of course.parts) {
  if (!existsSync(path.join(root, `curriculum/${p.folder}/README.md`))) fail(`part ${p.id}: missing README`);
  for (const s of p.sections) if (!existsSync(path.join(root, s.file))) fail(`part ${p.id}${s.id}: missing ${s.file}`);
}
for (const e of course.exercises) {
  for (const f of [e.lesson, ...e.files, ...(e.test ? [e.test] : [])]) if (!existsSync(path.join(root, f))) fail(`${e.id}: missing ${f}`);
  if (!e.manual) for (const f of e.files) if (!existsSync(path.join(root, f.replace(/^app\//, "solutions/")))) fail(`${e.id}: no solution for ${f}`);
}

const tested = course.exercises.filter(e => !e.manual);
console.log(c.dim("Running tests against the solutions…"));
const sol = runTests({ SOLUTIONS: "1" });
for (const e of tested) { const r = sol.get(e.test!); if (!r || r.failed > 0 || r.passed === 0) fail(`${e.id}: solution does not pass`); }
console.log(c.dim("Running tests against the starters…"));
const start = runTests();
for (const e of tested) { const r = start.get(e.test!); if (r && r.failed === 0) fail(`${e.id}: the starter already passes`); }

if (ok) console.log(c.green(`✔ ${tested.length} tested exercises (+${course.exercises.length - tested.length} without tests): solutions pass, starters fail, files present.`));
process.exit(ok ? 0 : 1);
