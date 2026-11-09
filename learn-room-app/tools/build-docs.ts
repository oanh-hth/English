/**
 * Maintainer tool: builds parts/*.md (what learners read) from
 *   parts/_theory/partN.md   hand-written theory
 *   curriculum.json          exercises, hints, milestones, checks
 * so the exercise lists can never disagree with the CLI. Run: npm run docs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface Exercise { id: string; title: string; practice: string; tests: string[]; files: string[]; goal: string; hints: string[] }
interface Part { id: number; title: string; theory: string; goal: string; milestone: { text: string; run: string }; exercises: Exercise[]; manual: { id: string; text: string }[] }

const ROOT = new URL('..', import.meta.url).pathname;
const curriculum = JSON.parse(readFileSync(join(ROOT, 'curriculum.json'), 'utf8')) as { parts: Part[] };
mkdirSync(join(ROOT, 'parts'), { recursive: true });

for (const part of curriculum.parts) {
  const theory = readFileSync(join(ROOT, 'parts', '_theory', `part${part.id}.md`), 'utf8').trim();
  const first = part.exercises[0]?.id;
  const last = part.exercises[part.exercises.length - 1]?.id;
  const out: string[] = [];
  out.push(`# Part ${part.id}: ${part.title}`, '', '> Generated from `parts/_theory` and `curriculum.json` by `npm run docs`. Edit those, not this file.', '');
  out.push(`**In this part:** ${part.goal}`, '', theory, '');
  out.push(`## Exercises ${first}${first === last ? '' : `-${last}`}`, '');
  out.push('Work in `src/`, read the doc comment above each function (it is the specification), and read the tests: they are examples of how your code is used. Check with `npm run check <id>`. Hints are one command away: `npm run learn -- hint <id>`.', '');
  for (const e of part.exercises) {
    out.push(`### ${e.id} ${e.title}`, '', e.goal, '');
    out.push(`* **Practice:** ${e.practice}`);
    out.push(`* **Edit:** ${e.files.length ? e.files.map((f) => `\`${f}\``).join(', ') : 'nothing'}`);
    out.push(`* **Tests:** ${e.tests.map((t) => `\`${t}\``).join(', ')}`);
    out.push(`* **Run:** \`npm run check ${e.id}\``, '');
    out.push('<details><summary>Hints</summary>', '');
    e.hints.forEach((h, i) => out.push(`${i + 1}. ${h}`));
    out.push('', '</details>', '');
  }
  out.push(`## What your app can do now`, '', part.milestone.text, '', '```bash', part.milestone.run, '```', '');
  out.push(`## Check yourself`, '', 'Tick these with `npm run learn -- tick <id>` when you can honestly say yes.', '');
  for (const m of part.manual) out.push(`- **${m.id}** ${m.text}`);
  out.push('');
  writeFileSync(join(ROOT, part.theory), out.join('\n'));
}
console.log(`Wrote ${curriculum.parts.length} part documents in parts/`);
