# Build Phòng Trữ Đồ: a full-stack course

A self-paced course in the style of *Full Stack Open*. You build **one app** from nothing, in **eight parts**. Every part has the theory you need and exercises that add to the app, and every exercise has tests you must make green. When you finish part 8 you have the whole app.

**Phòng Trữ Đồ** ("storage room") is a room that holds the things you buy: add items by hand or from a bill, get expiry reminders, see this month's spending against last month's, and let Miso the cat and Misu the dog nag you about it.

Stack: **TypeScript 7, Node.js 22, Express 5, zod 4, React 19, Vite, Vitest 5, Testing Library.** The original JavaScript app is in [`../room`](../room); this course rebuilds it properly.

## The parts

| Part | You learn | You add to the app | You can then run |
|---|---|---|---|
| [0](parts/part0-setup.md) | Tools, the red-green loop | | `npm run check` |
| [1](parts/part1-domain.md) | TypeScript, pure functions, dates | Items, expiry, spending comparison | a terminal **report** |
| [2](parts/part2-rules.md) | Unicode text, regex, Map and Set | Same-product, rebuy rule, idle items, category guessing | **add** items from the terminal |
| [3](parts/part3-bills.md) | Parsing, injecting dependencies | Receipt, Shopee and café bill readers | **import bills** |
| [4](parts/part4-backend.md) | Node, Express, zod, files, HTTP | A REST API with a JSON file | the **server** |
| [5](parts/part5-react.md) | React components, forms, Testing Library | Spending card, attention list, form, room | the component **gallery** |
| [6](parts/part6-state.md) | Reducers, pointer events, refs | Item state, dragging | a room you can **drag** |
| [7](parts/part7-fullstack.md) | fetch, effects, optimistic updates | API client, `useItems`, `App` | the **full-stack app** |
| [8](parts/part8-finish.md) | Composition, async UI | Miso and Misu, delete, bill import in the browser | the **finished app** |

32 exercises, 300+ tests. Each part document ends with what your app can do and a few "check yourself" questions.

## Start

Requires Node.js 20 or newer.

```bash
cd learn-room-app
npm install
npm run next        # what to do now
```

Read [part 0](parts/part0-setup.md), then work through the parts in order. Your working files are in **`src/`**; every function you must write is a stub:

```ts
export function toISO(date: Date): string {
  // TODO: Pad month and day to two digits. Careful: date.toISOString() uses UTC ...
  throw new Error('Not implemented yet');
}
```

Delete the `throw`, write the code, run `npm run check`. Passing an exercise ticks it in [`CHECKLIST.md`](CHECKLIST.md).

| Command | What it does |
|---|---|
| `npm run next` | The next unfinished exercise, and which part to read |
| `npm run check` | Run the tests of the next exercise (`npm run check 1.2` for a specific one, `npm run check 2` for a whole part) |
| `npm run learn` | Progress overview |
| `npm run learn -- hint 1.2` | Reveal one hint at a time |
| `npm run learn -- tick 1.m1` | Tick a "check yourself" item |
| `npm run learn -- reset 1.2 --yes` | Restore the starter file of an exercise |
| `npm run test:watch` | Re-run all tests on every save |
| `npm run typecheck` | Ask the TypeScript compiler for problems |
| `npm run room` | The terminal app (parts 1 to 3, and the pets from part 8) |
| `npm run server` | The API (part 4) |
| `npm run dev` | The React app (parts 5 to 8); `/#gallery` shows every component |

## Rules of the game

* **Edit only `src/`** (and never `tests/`). Make the code fit the tests.
* Go in order. Later exercises reuse earlier ones, and each part's milestone needs the whole part.
* `solutions/` holds a complete reference app. Treat it as spoilers.
* Code that needs the clock or an HTTP client receives it as a parameter, so tests are deterministic.
* Your progress is in `progress.json` (not committed); `CHECKLIST.md` is the readable version.

## For maintainers

```bash
npm run verify    # solutions pass every exercise, fresh starter files fail every exercise (except 0.1), types are clean
npm run docs      # rebuild parts/*.md from parts/_theory/*.md + curriculum.json
npm run stubs     # regenerate starter files (never overwrites; --force does)
```

Starter files are generated from the solutions. In a solution file, code between

```ts
// @solution-start <hint shown to the learner>
// @stub <optional line to keep instead of "throw">
...real code...
// @solution-end
```

becomes `// TODO: <hint>` and `throw new Error('Not implemented yet')`, so solutions and starter files cannot drift apart. To add an exercise: write the solution with markers, write tests under `tests/partN/`, add it to `curriculum.json`, then run `npm run stubs`, `npm run docs` and `npm run verify`.

## Layout

```
parts/              the course text, one document per part (generated; theory lives in parts/_theory)
tests/partN/        the exercises' tests (do not edit)
src/domain          pure logic         ← parts 1 to 3, 8
src/server          Node + Express     ← part 4
src/client          React              ← parts 5 to 8 (Gallery and main.tsx are provided)
src/cli             the terminal app (provided)
samples/            example bills
solutions/src       the reference app (spoilers)
tools/              learn CLI, starter-file and docs generators
curriculum.json     parts, exercises, hints, checks
CHECKLIST.md        generated progress checklist
```
