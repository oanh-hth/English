# Learn React, TypeScript and Node.js by building Phòng Trữ Đồ

A self-paced course. You rebuild a real app, a **room that holds the things you buy** (expiry reminders, month-vs-last-month spending, bill reading, a rebuy rule), one small exercise at a time.

* **6 phases**, each starts with a short lesson (`lessons/`)
* **27 exercises**, each has a test file you must make green
* **A checklist** (`CHECKLIST.md`) that updates itself when you pass an exercise, plus knowledge checks you tick yourself
* Stack: **TypeScript 7, Node.js 22, Express 5, zod 4, React 19, Vite, Vitest 5, Testing Library**

The original app (plain JavaScript, Vietnamese UI) lives in [`../room`](../room). This course rebuilds its logic in TypeScript and its screen in React, in English.

## Start

Requires Node.js 20 or newer.

```bash
cd learn-room-app
npm install
npm run next        # what to do now
npm run check       # run the tests of the current exercise
```

Your first exercise (0.1) already passes: it only proves your setup works. Then read [`lessons/01-typescript-and-pure-functions.md`](lessons/01-typescript-and-pure-functions.md) and start exercise 1.1.

## How it works

Your working files are in **`src/`**. Each function you must write is a stub:

```ts
export function toISO(date: Date): string {
  // TODO: Pad month and day to two digits. Careful: date.toISOString() uses UTC ...
  throw new Error('Not implemented yet');
}
```

Delete the `throw`, write the code, run `npm run check`. The tests in `tests/` are the specification: read them, they show how your code is used.

| Command | What it does |
|---|---|
| `npm run next` | Describe the next unfinished exercise |
| `npm run check` | Run the tests of the next exercise |
| `npm run check 1.2` | Run exercise 1.2 (or `npm run check 2` for all of phase 2) |
| `npm run learn` | Progress overview |
| `npm run learn -- hint 1.2` | Reveal one hint at a time |
| `npm run learn -- tick 1.m1` | Tick a knowledge check |
| `npm run learn -- reset 1.2 --yes` | Restore the starter file of an exercise |
| `npm run test:watch` | Re-run all tests on every save |
| `npm run typecheck` | Ask the TypeScript compiler for problems |
| `npm run server` | Run the API (after phase 3) |
| `npm run dev` | Run the React app (after phase 5) |

## The course

| Phase | Topic | You build |
|---|---|---|
| 0 | Setup and tools | Nothing: the loop of "red, green" |
| 1 | TypeScript and pure functions | Item types, dates, expiry rules, spending comparison |
| 2 | Strings, regex and collections | Same-product detection, rebuy rule, dormant items, category guessing, receipt / Shopee / café bill parsers |
| 3 | Node.js API | Store, JSON file persistence, zod validation, Express routes |
| 4 | React components | Reducer, drag maths, add-item form, attention list, spending card, room |
| 5 | Full stack | Typed API client, `useItems` hook with optimistic updates, `App` |

## Rules of the game

* **Edit only `src/`.** Do not change `tests/`. Make the code fit the tests.
* One exercise at a time, in order. Later exercises reuse earlier ones.
* `solutions/` holds complete reference code. Treat it as spoilers.
* Tests that need the clock or randomness receive them as parameters, so they are deterministic.
* Your progress is stored in `progress.json` (not committed). `CHECKLIST.md` is the readable version.

## For maintainers

```bash
npm run verify
```

checks, in about ten seconds, that

1. the tests of **every** exercise pass against `solutions/src`,
2. the freshly generated starter files fail **every** exercise (except 0.1),
3. both `src/` and `solutions/src` type-check.

The starter files are generated from the solutions by `tools/make-stubs.ts` (`npm run stubs`; it never overwrites existing files, `--force` does). In a solution file, code between

```ts
// @solution-start <hint shown to the learner>
// @stub <optional line to keep instead of "throw">
...real code...
// @solution-end
```

is replaced by `// TODO: <hint>` and `throw new Error('Not implemented yet')`. So the solutions and the starting files cannot drift apart. To add an exercise: write the solution with markers, write the tests under `tests/phaseN/`, add the entry to `curriculum.json`, run `npm run stubs` and `npm run verify`.

## Layout

```
lessons/            one short lesson per phase
tests/              the exercises' tests (do not edit)
src/domain          pure logic          ← phases 1 and 2
src/server          Node + Express      ← phase 3
src/client          React               ← phases 4 and 5
solutions/src       reference solutions (spoilers)
tools/              learn CLI + starter-file generator
curriculum.json     phases, exercises, hints, knowledge checks
CHECKLIST.md        generated progress checklist
```
