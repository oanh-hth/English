# Crochet Academy

**Learn React, TypeScript and Node by building a real app, part by part.** The course is organised like [Full Stack Open](https://fullstackopen.com): each **part** is a chapter, each part has lettered **sections** (1a, 1b, ...) that explain what you need to know, and each section ends with **exercises** that put it to work. Finish all the parts and you have a finished, full-stack app.

The app is a crochet chart maker. You build a pattern row by row from a list of stitches, see it drawn as a chart (rows or rings), paste a written pattern to import it, or upload a photo of a finished coaster to get a starting chart. The original, plain-JavaScript version is in [`../crochet/`](../crochet/index.html): open it to see where you are heading.

```
 read a section  ─►  do its exercises (tests go red → green)  ─►  checklist ticks  ─►  the app gains a feature
```

## Start here

```bash
cd crochet-academy
npm install            # needs Node 20+
npm run learn          # runs every test and shows your checklist (all red at first)
npm run learn next     # what to do now, and which section to read
```
Read [Part 0](docs/part0-getting-started/README.md), then work through the parts in order.

## The parts

| Part | Sections | You learn | The app gains |
|---|---|---|---|
| [**0** Getting started](docs/part0-getting-started/README.md) | 0a 0b | how the course works, the red → green loop | a working project |
| [**1** TypeScript and the data model](docs/part1-typescript/README.md) | 1a 1b 1c | types, unions, narrowing, recursion, `reduce`, immutability, Vitest | the pattern model, written pattern, mistake hints |
| [**2** Parsing written patterns](docs/part2-parsing/README.md) | 2a 2b 2c | regular expressions, scanning, recursion, tolerant input | **Import pattern** |
| [**3** React and TypeScript UI](docs/part3-react/README.md) | 3a 3b 3c 3d | components, props, `useReducer`, events, accessibility, SVG, Testing Library | **the editor** and both chart drawings |
| [**4** The Node API](docs/part4-node/README.md) | 4a 4b 4c | `unknown` and validation, repository pattern, Express, status codes, async files | **the server** that saves charts |
| [**5** Full stack and the finish](docs/part5-fullstack/README.md) | 5a 5b 5c 5d | typed `fetch`, hooks, algorithms, generating data | the connection to the server and **Import from photo** |

24 exercises, each with a test file, three hints and a reference solution.

## What a section looks like

Every section is a short tutorial: an idea, a small example, how it shows up in the app, then an **Exercises** box such as:

> **Exercises 1.1.-1.2.**
> 1.1 Stitch lookup, `src/core/stitchLookup.ts` · 1.2 Expand items into stitches, `src/core/expand.ts`

Each exercise has a folder:

```
exercises/part1-typescript/1.2-expand/
  README.md        what to build, why it matters, "done when"
  hints.md         three hints, shown one at a time by `learn hint`
  expand.test.ts   the specification, written as tests (never edit)
src/core/expand.ts            ← the stub you edit: replace todo('1.2') with real code
solutions/src/core/expand.ts  ← the reference solution
```
The stubs live **in the real app**, so finishing an exercise changes the running app. While one is still a stub, the page shows a purple "Waiting for exercise 3.1" card where its feature will appear, and the rest keeps working.

## The checklist

`npm run learn` prints your progress and saves it in [`CHECKLIST.md`](CHECKLIST.md), in the order you study:

```
Part 1 · TypeScript and the data model
  ✔ Read 1a Describing a pattern with types
      ✔ Exercise 1.1 Stitch lookup           9/9 tests
      ✖ Exercise 1.2 Expand items            3/10 tests
  ✖ Read 1b Small functions over the model
  ...
  ✖ Write the review answers for part 1 in notes/part1.md
  ✖ Milestone: npm run typecheck is clean, and ...
```
* **Exercises** tick themselves when *all* their tests pass.
* **Reading the sections, the review answers and the milestones** you tick yourself: `npm run learn check p1a.read`.

| Command | |
|---|---|
| `npm run learn` | run all tests, print and save the checklist |
| `npm run learn next` | the next exercise, the section to read, the files to edit |
| `npm run learn test 1.2` | run one exercise (`... 1.2 watch` re-runs on save) |
| `npm run learn hint 1.2` | the next hint of three, each stronger than the last |
| `npm run learn solution 1.2 yes` | print the reference solution (try the hints first!) |
| `npm run learn check <id>` / `uncheck <id>` | tick a manual item |
| `npm run learn reset yes` | clear manual ticks and hint history |
| `npm run typecheck` | check every file with TypeScript |
| `npm run dev` | start the API (3001) and the web app (http://localhost:5173) |

## Rules

1. Edit only the stub files an exercise names. **Never edit the tests.**
2. Keep exported names and signatures; replace the `todo()` calls.
3. Work in order: later exercises call your earlier code.
4. Stuck for 15 minutes? `learn hint`. Done? compare with `learn solution`.
5. Commit each green exercise on your own branch. Your history is your journal.

## What is provided

The data model and stitch catalogue (`src/shared/`), the stitch drawings, the app shell, pages and styles (`src/client/`), the photo analysis (`src/client/photo/`), the server entry point (`src/server/index.ts`), test helpers and the checklist tool. Reading this code is part of the course: it shows how your pieces fit together.

## Tech

TypeScript 7 · React 18 · Vite · Express 4 · Vitest · Testing Library · supertest · tsx.

## For maintainers

`npm run verify` checks that: every part, section and exercise has its files; each exercise **starts red** against the starter code; and with `solutions/` copied over the starter, the **type check, all tests and the client build pass**. Run it after changing any exercise, test, solution or lesson.

To add an exercise: write the stub, the solution (same path under `solutions/`), the test, `README.md` and `hints.md` (three `## Hint N` sections), add it to `curriculum/curriculum.ts` (in a section), and link it from that section's page.
