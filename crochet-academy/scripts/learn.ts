/**
 * The Crochet Academy coach.  npm run learn [command]
 *
 *   (none) / status     run every test, print the checklist, write CHECKLIST.md
 *   next                what to work on now
 *   test <id> [watch]   run the tests of one exercise, e.g.  npm run learn test 1.2
 *   hint <id> [level]   show the next hint (or a given one) for an exercise
 *   solution <id> yes   show the reference solution (try the hints first!)
 *   check <item>        tick a manual item (reading, quiz, milestone); ids are shown in the checklist
 *   uncheck <item>      untick it
 *   reset yes           clear your manual ticks and hint history
 *   status fast         reprint the checklist from the last test run (no re-run)
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { ALL_EXERCISES, MANUAL_ITEMS, PHASES, exercisePath, findExercise, type Phase } from '../curriculum/curriculum';

const root = resolve(import.meta.dirname, '..');
const stateDir = join(root, '.learn');
const progressFile = join(stateDir, 'progress.json');
const resultsFile = join(stateDir, 'results.json');
const bin = (name: string) => join(root, 'node_modules', '.bin', name);

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code: number, text: string) => (color ? `\x1b[${code}m${text}\x1b[0m` : text);
const green = (t: string) => paint(32, t), red = (t: string) => paint(31, t), dim = (t: string) => paint(2, t), bold = (t: string) => paint(1, t), yellow = (t: string) => paint(33, t), cyan = (t: string) => paint(36, t);

/* ------------------------------------------------------------------ progress (manual ticks, hints seen) */
interface Progress { done: string[]; hints: Record<string, number> }

function loadProgress(): Progress {
  try {
    const data = JSON.parse(readFileSync(progressFile, 'utf8')) as Partial<Progress>;
    return { done: data.done ?? [], hints: data.hints ?? {} };
  } catch {
    return { done: [], hints: {} };
  }
}
function saveProgress(progress: Progress) {
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(progressFile, JSON.stringify(progress, null, 2));
}

/* ------------------------------------------------------------------ test results */
interface Result { passed: number; failed: number; loadError: boolean }
interface VitestSuite { name: string; status: string; assertionResults: { status: string }[] }

function runTests(extraArgs: string[] = []): Map<string, Result> {
  mkdirSync(stateDir, { recursive: true });
  spawnSync(bin('vitest'), ['run', '--reporter=json', `--outputFile=${resultsFile}`, ...extraArgs], { cwd: root, encoding: 'utf8' });
  return readResults();
}

function readResults(): Map<string, Result> {
  const map = new Map<string, Result>();
  if (!existsSync(resultsFile)) return map;
  const json = JSON.parse(readFileSync(resultsFile, 'utf8')) as { testResults: VitestSuite[] };
  for (const suite of json.testResults) {
    const match = suite.name.split(sep).join('/').match(/exercises\/[^/]+\/(\d+\.\d+)-/);
    if (!match) continue;
    const entry = map.get(match[1]) ?? { passed: 0, failed: 0, loadError: false };
    for (const a of suite.assertionResults) {
      if (a.status === 'passed') entry.passed++;
      else entry.failed++;
    }
    if (suite.assertionResults.length === 0 && suite.status !== 'passed') { entry.failed++; entry.loadError = true; }
    map.set(match[1], entry);
  }
  return map;
}

const isDone = (r?: Result) => !!r && r.failed === 0 && r.passed > 0;

/* ------------------------------------------------------------------ checklist model */
interface Line { kind: 'manual' | 'exercise'; id: string; label: string; done: boolean; detail?: string }
interface PhaseView { phase: Phase; lines: Line[]; done: number; total: number }

function buildView(results: Map<string, Result>, progress: Progress): PhaseView[] {
  return PHASES.map((phase) => {
    const lines: Line[] = [
      ...phase.knowledge.map((m): Line => ({ kind: 'manual', id: m.id, label: m.label, done: progress.done.includes(m.id) })),
      ...phase.exercises.map((e): Line => {
        const r = results.get(e.id);
        const total = r ? r.passed + r.failed : 0;
        const detail = !r ? 'not run yet' : r.loadError && r.passed === 0 ? 'not built yet' : `${r.passed}/${total} tests`;
        return { kind: 'exercise', id: e.id, label: `${e.id} ${e.title}`, done: isDone(r), detail };
      }),
      { kind: 'manual', id: phase.milestone.id, label: `Milestone: ${phase.milestone.label}`, done: progress.done.includes(phase.milestone.id) },
    ];
    return { phase, lines, done: lines.filter((l) => l.done).length, total: lines.length };
  });
}

const bar = (done: number, total: number, width = 12) => {
  const filled = total ? Math.round((done / total) * width) : 0;
  return '█'.repeat(filled) + '░'.repeat(width - filled);
};

function printStatus(view: PhaseView[]) {
  const done = view.reduce((n, p) => n + p.done, 0);
  const total = view.reduce((n, p) => n + p.total, 0);
  console.log(`\n${bold('Crochet Academy')}  ${done}/${total} checklist items  ${green(bar(done, total, 20))} ${Math.round((done / total) * 100)}%\n`);
  for (const p of view) {
    const complete = p.done === p.total;
    console.log(`${bold(`Phase ${p.phase.id} · ${p.phase.title}`)}  ${complete ? green(bar(p.done, p.total)) : bar(p.done, p.total)} ${p.done}/${p.total}`);
    for (const l of p.lines) {
      const mark = l.done ? green('✔') : red('✖');
      const detail = l.detail ? dim(`  ${l.detail}`) : '';
      const hint = !l.done ? dim(l.kind === 'manual' ? `  npm run learn check ${l.id}` : `  npm run learn test ${l.id}`) : '';
      console.log(`  ${mark} ${l.label}${detail}${hint}`);
    }
    console.log('');
  }
}

function writeChecklist(view: PhaseView[]) {
  const done = view.reduce((n, p) => n + p.done, 0);
  const total = view.reduce((n, p) => n + p.total, 0);
  const out = [
    '# Crochet Academy checklist',
    '',
    `**Progress: ${done}/${total} items (${Math.round((done / total) * 100)}%)**`,
    '',
    '_Generated by `npm run learn`. Exercises tick themselves when all their tests pass; tick the rest with `npm run learn check <id>`._',
    '',
  ];
  for (const p of view) {
    out.push(`## Phase ${p.phase.id} · ${p.phase.title} (${p.done}/${p.total})`, '', `_${p.phase.goal}_`, '');
    for (const l of p.lines) {
      const ex = l.kind === 'exercise' ? findExercise(l.id) : undefined;
      const link = ex ? ` ([instructions](${exercisePath(ex)}/README.md))` : ` \`${l.id}\``;
      out.push(`- [${l.done ? 'x' : ' '}] ${l.label}${link}${l.detail ? ` — ${l.detail}` : ''}`);
    }
    out.push('');
  }
  writeFileSync(join(root, 'CHECKLIST.md'), out.join('\n'));
}

/* ------------------------------------------------------------------ commands */
function status(fast: boolean) {
  if (!fast) console.log(dim('Running the tests…'));
  const results = fast ? readResults() : runTests();
  const view = buildView(results, loadProgress());
  printStatus(view);
  writeChecklist(view);
  next(results, true);
}

function next(results: Map<string, Result>, brief = false) {
  const todo = ALL_EXERCISES.find((e) => !isDone(results.get(e.id)));
  if (!todo) {
    console.log(green('Every exercise is green. Finish the manual items above, then read the last lesson for what to build next.'));
    return;
  }
  const blockers = todo.needs.filter((n) => !isDone(results.get(n)));
  console.log(`${bold('Next up:')} ${cyan(`${todo.id} ${todo.title}`)}  ${dim(`(Phase ${todo.phase.id})`)}`);
  if (brief) {
    console.log(dim(`  npm run learn next   for the full briefing`));
    return;
  }
  console.log(`  Practise:  ${todo.concepts.join(', ')}`);
  console.log(`  Read:      ${exercisePath(todo)}/README.md`);
  console.log(`  Edit:      ${todo.files.join(', ')}`);
  console.log(`  Test:      npm run learn test ${todo.id}`);
  console.log(`  Stuck?     npm run learn hint ${todo.id}`);
  if (blockers.length) console.log(yellow(`  Heads up:  this uses the code of exercise ${blockers.join(', ')}, which is not green yet. Do that first.`));
}

function needExercise(id?: string) {
  const exercise = id ? findExercise(id) : undefined;
  if (!exercise) {
    console.error(red(`Unknown exercise "${id ?? ''}".`) + ` Try one of: ${ALL_EXERCISES.map((e) => e.id).join(', ')}`);
    process.exit(2);
  }
  return exercise;
}

function testOne(id: string | undefined, watch: boolean) {
  const exercise = needExercise(id);
  const args = watch ? [exercisePath(exercise)] : ['run', exercisePath(exercise)];
  const r = spawnSync(bin('vitest'), args, { cwd: root, stdio: 'inherit' });
  if (!watch) {
    console.log(r.status === 0 ? green(`\n✔ Exercise ${exercise.id} is green. Run npm run learn to tick it off.`) : yellow(`\nNot green yet. Hint: npm run learn hint ${exercise.id}`));
  }
  process.exit(r.status ?? 1);
}

function hint(id: string | undefined, levelArg?: string) {
  const exercise = needExercise(id);
  const file = join(root, exercisePath(exercise), 'hints.md');
  const hints = readFileSync(file, 'utf8').split(/^## Hint \d+\s*$/m).slice(1).map((h) => h.trim());
  const progress = loadProgress();
  const level = levelArg ? Number(levelArg) : (progress.hints[exercise.id] ?? 0) + 1;
  if (!Number.isInteger(level) || level < 1 || level > hints.length) {
    console.log(`There are ${hints.length} hints for ${exercise.id}. Ask for one with: npm run learn hint ${exercise.id} 1`);
    return;
  }
  console.log(bold(`Hint ${level} of ${hints.length} · ${exercise.id} ${exercise.title}\n`));
  console.log(hints[level - 1]);
  console.log(dim(level < hints.length ? `\nStill stuck? npm run learn hint ${exercise.id}` : `\nThat was the last hint. npm run learn solution ${exercise.id} yes shows the reference solution.`));
  progress.hints[exercise.id] = Math.max(progress.hints[exercise.id] ?? 0, level);
  saveProgress(progress);
}

function solution(id: string | undefined, confirmed: boolean) {
  const exercise = needExercise(id);
  if (!confirmed) {
    console.log(`The reference solution for ${bold(`${exercise.id} ${exercise.title}`)} is in:`);
    for (const f of exercise.files) console.log(`  solutions/${f}`);
    console.log(yellow(`\nYou learn the most by trying first: run npm run learn hint ${exercise.id}. To print it anyway:  npm run learn solution ${exercise.id} yes`));
    return;
  }
  for (const f of exercise.files) {
    console.log(bold(`\n// solutions/${f}\n`));
    console.log(readFileSync(join(root, 'solutions', f), 'utf8'));
  }
}

function tick(id: string | undefined, on: boolean) {
  const item = MANUAL_ITEMS.find((m) => m.id === id);
  if (!item) {
    const exerciseHint = id && findExercise(id) ? ' Exercises tick themselves when their tests pass.' : '';
    console.error(red(`"${id ?? ''}" is not a manual checklist item.`) + exerciseHint + ` Items: ${MANUAL_ITEMS.map((m) => m.id).join(', ')}`);
    process.exit(2);
  }
  const progress = loadProgress();
  progress.done = on ? [...new Set([...progress.done, item.id])] : progress.done.filter((d) => d !== item.id);
  saveProgress(progress);
  console.log(`${on ? green('✔ ticked') : yellow('unticked')}: ${item.label}`);
  writeChecklist(buildView(readResults(), progress));
}

function reset(confirmed: boolean) {
  if (!confirmed) return console.log('This clears your manual ticks and hint history (not your code). Run again with: npm run learn reset yes');
  saveProgress({ done: [], hints: {} });
  console.log('Progress reset.');
}

function help() {
  console.log(readFileSync(import.meta.filename, 'utf8').split('*/')[0].replace('/**', '').replace(/^ \* ?/gm, '').trim());
}

const [command = 'status', ...args] = process.argv.slice(2);
// npm swallows some --flags (like --yes), so plain words work too: `npm run learn solution 1.3 yes`
const WORDS = new Set(['yes', 'watch', 'fast']);
const flags = new Set(args.filter((a) => a.startsWith('--') || WORDS.has(a)).map((a) => a.replace(/^--/, '')));
const positional = args.filter((a) => !a.startsWith('--') && !WORDS.has(a));

switch (command) {
  case 'status': status(flags.has('fast')); break;
  case 'next': next(runTests()); break;
  case 'test': testOne(positional[0], flags.has('watch')); break;
  case 'hint': hint(positional[0], positional[1]); break;
  case 'solution': solution(positional[0], flags.has('yes')); break;
  case 'check': tick(positional[0], true); break;
  case 'uncheck': tick(positional[0], false); break;
  case 'reset': reset(flags.has('yes')); break;
  case 'help': case '--help': help(); break;
  default: console.error(`Unknown command "${command}".\n`); help(); process.exit(2);
}
