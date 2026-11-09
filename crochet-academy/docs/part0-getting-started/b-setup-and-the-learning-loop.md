# 0b · Setup and the learning loop

## Install
```bash
node -v          # should print v20 or higher
cd crochet-academy
npm install      # installs everything, once
npm run learn    # runs all the tests and prints your checklist
```
Everything is red at the start. That is exactly right.

## The loop
```
open the exercise README  →  run its tests (RED)  →  write code  →  tests pass (GREEN)  →  commit
```
Try it with the first exercise:

```bash
npm run learn next          # tells you what to do now
npm run learn test 0.1      # runs the tests of exercise 0.1
```
You will see something like:
```
FAIL  0.1 welcome > greets by name
Error: Exercise 0.1 is not built yet
```
That message comes from the stub in `src/core/welcome.ts`. Read the exercise README, replace the `todo('0.1')` line with real code, and run the command again.

## Reading a failing test
```
AssertionError: expected 'Welcome!' to be 'Welcome to the nook, Ana!'
```
The first value is **what your code returned**, the second is **what the test expected**. The line above it names the test, and the test file shows the exact input.

## The commands
| Command | What it does |
|---|---|
| `npm run learn` | run every test, print and save the checklist |
| `npm run learn next` | the next exercise, the section to read and the files to edit |
| `npm run learn test 1.2` | run one exercise (`... 1.2 watch` re-runs on every save) |
| `npm run learn hint 1.2` | the next hint of three, each stronger than the last |
| `npm run learn solution 1.2 yes` | print the reference solution (try the hints first) |
| `npm run learn check p1a.read` | tick a manual item, such as "read section 1a" |
| `npm run typecheck` | ask TypeScript to check every file |
| `npm run dev` | start the API (port 3001) and the web app (http://localhost:5173) |

## Rules of the game
1. Edit only the **stub files** named in an exercise. Never edit the tests: they are the specification.
2. Keep the exported names and signatures. Fill in the bodies and remove the `todo(...)` line.
3. Work in order. Later exercises call code you wrote earlier (each exercise README says which).
4. When an exercise is green, commit it.

## Seeing your work in the browser
`npm run dev` starts the API and the web app. You do not have to finish anything first:

* A feature whose exercise is still a stub shows a purple **"Waiting for exercise X"** card telling you what to build.
* When you finish the exercise and save the file, the card turns into the real feature.
* Until you build the API client and data hook (part 5), charts are saved in your browser, and a note at the top of the page says so.
* Saving a plain `.ts` file can make the page reload. If it matters, press **Save** in the app first.

## A tour of the repository
```
docs/             the course text (you are reading it)
exercises/        one folder per exercise: README.md, hints.md and the tests
src/shared/       the data model and the stitch catalogue (provided)
src/core/         pure logic: counting, writing, editing patterns   ← part 1, and 5
src/parse/        the pattern text parser                           ← part 2
src/client/       the React app                                     ← parts 3 and 5
src/server/       the Express API                                   ← part 4
solutions/        reference solutions (peek only after trying)
notes/            where you write your review answers
curriculum/       the syllabus that drives the checklist
```

## Exercises 0.1

| | |
|---|---|
| **0.1** [Your first green test](../../exercises/part0-getting-started/0.1-first-green/README.md) | edit `src/core/welcome.ts`, run `npm run learn test 0.1` |

When it is green, run `npm run learn`, tick the two items `p0a.read` and `p0b.read`, and answer the review questions in the [part README](README.md). Then go to [part 1](../part1-typescript/README.md).
