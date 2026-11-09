# Part 0: Setup and how this course works

> Generated from `parts/_theory` and `curriculum.json` by `npm run docs`. Edit those, not this file.

**In this part:** Install everything and learn the red-green loop.

This course is organised like *Full Stack Open*: eight parts, each with the theory you need and exercises that add to **one** app. After every part there is something you can run, and after part 8 you have the whole app.

## a) The loop you will repeat

1. `npm run next` tells you what to build and which file to open.
2. Open the file in `src/`. Every function you must write contains a `// TODO:` comment with a hint and a line `throw new Error('Not implemented yet')`. Delete the throw and write the code.
3. `npm run check` runs the tests of the current exercise. Red means "not yet", and the message tells you what is wrong.
4. When all tests are green the exercise is ticked in `CHECKLIST.md` and you move on.

## b) Tools you will meet

| Tool | What it is for | Where |
|---|---|---|
| **TypeScript** | JavaScript with types. The compiler finds mistakes before you run the code. | `npm run typecheck` |
| **Vitest** | Runs the tests (`describe`, `it`, `expect`). | `tests/` |
| **Node.js** | Runs JavaScript outside the browser: our API server. | `src/server/` |
| **Express** | A small web framework for Node. | `src/server/app.ts` |
| **zod** | Validates data at runtime and gives you the TypeScript type for free. | `src/server/schema.ts` |
| **React** | Builds the user interface from components. | `src/client/` |
| **Testing Library** | Tests components the way a user uses them: by label, role and text. | `tests/phase4`, `tests/phase5` |

## c) How to read a failing test

```
✗ 1.2 Dates without surprises  12 passed, 2 failed
    • parseISO > rejects dates that roll over and badly shaped text
      AssertionError: expected [Function] to throw an error
```

1. Find the test with that name in the test file (tests are written to be read: they are examples of how your code is used).
2. Ask: *what input does it use and what does it expect?*
3. Change one thing, run `npm run check` again.

`npm run test:watch` re-runs automatically every time you save. Use it for long exercises.

The folder `solutions/` has a complete working version of every file. It is there so the course can verify itself, and as a last resort. Try the hints first (`npm run learn -- hint 1.2`). Looking at a solution before you tried teaches far less than being stuck for ten minutes.

## Exercises 0.1

Work in `src/`, read the doc comment above each function (it is the specification), and read the tests: they are examples of how your code is used. Check with `npm run check <id>`. Hints are one command away: `npm run learn -- hint <id>`.

### 0.1 Hello, tests

Nothing to write: run `npm run check` and watch it pass. This proves Node, TypeScript and Vitest work and that the `@/` import alias reaches your `src/` folder.

* **Practice:** Check that everything is installed
* **Edit:** nothing
* **Tests:** `tests/part0/setup.test.ts`
* **Run:** `npm run check 0.1`

<details><summary>Hints</summary>

1. Run the tests in watch mode with `npm run test:watch` and edit a file.
2. Find the `@` alias in vitest.config.ts and tsconfig.json.

</details>

## What your app can do now

All the tools work.

```bash
npm run check
```

## Check yourself

Tick these with `npm run learn -- tick <id>` when you can honestly say yes.

- **0.m1** I ran `npm run check` and saw exercise 0.1 pass
- **0.m2** I know `solutions/` holds spoilers and `src/` is where I work
- **0.m3** I can explain what `npm run typecheck` does that the tests do not
