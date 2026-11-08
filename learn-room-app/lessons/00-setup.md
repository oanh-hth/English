# Phase 0: Setup and tools

**Goal:** be able to run an exercise, read a failing test, and fix it.

## The loop you will repeat 27 times

1. `npm run next` tells you what to build and which file to open.
2. Open the file in `src/`. Every function you must write contains a `// TODO:` comment with a hint and a line `throw new Error('Not implemented yet')`. Delete the throw and write the code.
3. `npm run check` runs the tests of the current exercise. Red means "not yet", and the message tells you what is wrong.
4. When all tests are green the exercise is ticked in `CHECKLIST.md` and you move on.

## Tools you will meet

| Tool | What it is for | Where |
|---|---|---|
| **TypeScript** | JavaScript with types. The compiler finds mistakes before you run the code. | `npm run typecheck` |
| **Vitest** | Runs the tests (`describe`, `it`, `expect`). | `tests/` |
| **Node.js** | Runs JavaScript outside the browser: our API server. | `src/server/` |
| **Express** | A small web framework for Node. | `src/server/app.ts` |
| **zod** | Validates data at runtime and gives you the TypeScript type for free. | `src/server/schema.ts` |
| **React** | Builds the user interface from components. | `src/client/` |
| **Testing Library** | Tests components the way a user uses them: by label, role and text. | `tests/phase4`, `tests/phase5` |

## How to read a failing test

```
✗ 1.2 Dates without surprises  12 passed, 2 failed
    • parseISO > rejects dates that roll over and badly shaped text
      AssertionError: expected [Function] to throw an error
```

1. Find the test with that name in the test file (tests are written to be read: they are examples of how your code is used).
2. Ask: *what input does it use and what does it expect?*
3. Change one thing, run `npm run check` again.

`npm run test:watch` re-runs automatically every time you save. Use it for long exercises.

## About `solutions/`

The folder `solutions/` has a complete working version of every file. It is there so the course can verify itself, and as a last resort. Try the hints first (`npm run learn -- hint 1.2`). Looking at a solution before you tried teaches far less than being stuck for ten minutes.

## Checklist

- [ ] Run `npm run check` (exercise 0.1) and see it pass.
- [ ] Open `tests/phase1/dates.test.ts` and read the first few tests: this is the style of every test in the course.
- [ ] Run `npm run typecheck`. It should print nothing. Type errors are the compiler's way of helping.
