# Crochet Academy

**Learn React, TypeScript and Node by rebuilding a real app, one tested exercise at a time.**

You start with a project where every important function is a stub that says *"not built yet"*. Each exercise has a lesson to read, a spec, and a test file that fails until your code is right. When the tests pass, the exercise ticks itself on your checklist and a new piece of the app comes alive in the browser. At the end you have built a full-stack crochet chart maker: pattern parser, React editor with an SVG symbol chart, and a Node API that saves to disk.

```
 read the lesson ─► open the exercise ─► run its tests (red) ─► write code ─► green ─► checklist ticks
```

The app you are rebuilding is the vanilla JavaScript one in [`../crochet/`](../crochet/index.html). Open it to see where you are heading.

## Quick start

```bash
cd crochet-academy
npm install
npm run learn          # runs every test and shows your checklist (all red at first)
npm run learn next     # what to do now
```

Then read [`docs/phases/phase-0-setup.md`](docs/phases/phase-0-setup.md) and do exercise 0.1.

Requires **Node 20+**.

## The path

| Phase | You learn | You build | Exercises |
|---|---|---|---|
| **0** Setup | the red → green loop | a greeting | 0.1 |
| **1** TypeScript | types, unions, narrowing, recursion, immutability, Vitest | the pattern data model: lookup, expand, count, write, check, edit | 1.1 – 1.6 |
| **2** Parsing | regular expressions, scanning, recursion, tolerant input | the importer for written patterns | 2.1 – 2.3 |
| **3** React + TS | components, props, reducers, accessibility, SVG, Testing Library | stitch picker, row cards, reducer, layout maths, symbol chart | 3.1 – 3.5 |
| **4** Node | validation, repository pattern, Express, status codes, async files | the REST API and file persistence | 4.1 – 4.4 |
| **5** Full stack | typed `fetch`, custom hooks, state machines, algorithms | API client, data hook, round counter | 5.1 – 5.3 |

Every phase has: a **lesson** (`docs/phases/`), **exercises** with tests (`exercises/`), **checkpoint questions** to answer in `notes/`, and a **milestone** where you see it work in the running app.

## The checklist

`npm run learn` prints your progress and writes it to [`CHECKLIST.md`](CHECKLIST.md):

* **Exercises** tick themselves when *all* their tests pass.
* **Reading, checkpoint questions and milestones** are ticked by you: `npm run learn check p1.read`.

| Command | |
|---|---|
| `npm run learn` | run all tests, print and save the checklist |
| `npm run learn next` | the next exercise, with files to edit and what to read |
| `npm run learn test 1.2` | run one exercise (`... 1.2 watch` re-runs on save) |
| `npm run learn hint 1.2` | the next hint of three, each stronger than the last |
| `npm run learn solution 1.2 yes` | print the reference solution (try the hints first!) |
| `npm run learn check <id>` / `uncheck <id>` | tick a manual item |
| `npm run learn reset yes` | clear manual ticks and hint history |
| `npm run typecheck` | check every file with TypeScript |
| `npm run dev` | start the API (3001) and the web app (http://localhost:5173) |

## How an exercise is laid out

```
exercises/phase-1-typescript/1.2-expand/
  README.md        what to build, why it matters, "done when"
  hints.md         three hints, shown one at a time by `learn hint`
  expand.test.ts   the spec, written as tests (never edit)
src/core/expand.ts            ← the stub you edit; replace todo('1.2') with real code
solutions/src/core/expand.ts  ← the reference solution
```

The stubs live in the real app (`src/core`, `src/parse`, `src/client`, `src/server`), not in a sandbox. Finishing an exercise therefore *changes the running app*: while an exercise is still a stub, the page shows a purple card ("Waiting for exercise 3.1 …") where its feature will appear, and the rest keeps working.

## Rules

1. Edit only the stub files an exercise names. **Never edit the tests.**
2. Keep exported names and signatures; replace the `todo()` calls.
3. Work in order: later exercises call your earlier code.
4. Stuck 15 minutes? `learn hint`. Done? compare with `learn solution`.
5. Commit each green exercise on your own branch. Your history is your journal.

## What is provided (you do not write it)

The data model and catalogue (`src/shared/`), the glyph drawings, the app shell, pages and styles (`src/client/App.tsx`, `pages/`, `styles.css`), the server entry point (`src/server/index.ts`), test helpers and the checklist tool. Reading this code is part of the course: it shows how your pieces fit together.

## Tech

TypeScript 7 · React 18 · Vite · Express 4 · Vitest · Testing Library · supertest · tsx. No database, no build tooling to configure.

## For maintainers

Every exercise must be solvable and every test fair. `npm run verify` checks that:

1. each exercise **starts red** against the starter code;
2. with `solutions/` copied over the starter, the **type check, all tests and the client build pass**.

Run it after changing any exercise, test or solution. To add an exercise: write the stub, the solution (same path under `solutions/`), the test, `README.md`, `hints.md` (three `## Hint N` sections), and add it to `curriculum/curriculum.ts`.
