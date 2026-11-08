# Phase 0 · Setup and the learning loop

**Goal:** get the project running and learn the loop you will repeat about twenty times.

## The idea of this course
You will rebuild a small crochet chart app (the original lives in `../crochet/`) using **TypeScript, React and Node**. Instead of watching videos you work through **exercises**. Each exercise is one stub file in `src/` that throws "not built yet", plus a test file that describes exactly what it must do. When every test passes the exercise ticks itself in your checklist, and a new piece of the real app comes alive.

```
learn (read the lesson)  →  open the exercise README  →  run its tests (RED)
          ↑                                                         ↓
   tick the checklist  ←  all tests pass (GREEN)  ←  write the code ┘
```

## Setup
You need **Node 20 or newer** and **git**.

```bash
node -v                 # v20 or higher
npm install             # installs everything, once
npm run learn           # runs all the tests and prints your checklist
```

Everything is red at the start. That is the point.

## The commands you will use
| Command | What it does |
|---|---|
| `npm run learn` | Run every test, print and save the checklist (`CHECKLIST.md`) |
| `npm run learn next` | What to work on now, with the files and the reading |
| `npm run learn test 1.2` | Run the tests of one exercise. Add `watch` to re-run on save |
| `npm run learn hint 1.2` | Show the next hint (there are three, each stronger) |
| `npm run learn solution 1.2 yes` | Show the reference solution. Try the hints first |
| `npm run learn check p1.read` | Tick a manual item: reading, notes, milestones |
| `npm run typecheck` | Ask TypeScript to check every file |
| `npm run dev` | Start the API and the web app (http://localhost:5173) |

## Rules of the game
1. **Edit only the stub files** named in each exercise. Never edit the tests, they are the spec.
2. Keep the exported names and signatures. Fill in the bodies and remove the `todo(...)` line.
3. Work in order. Later exercises call your earlier code (each README says which).
4. Read a failing test from the top: the name says what is expected, the diff says what you returned.
5. When you are stuck for more than 15 minutes, take a hint. When you finish, compare with the solution.
6. Commit when an exercise turns green: `git commit -am "1.2 expand"`. Your history becomes your journal.

## Tour of the repository
```
docs/phases/      the lessons (you are here)
exercises/        one folder per exercise: README.md, hints.md and the tests
src/shared/       the data model and catalogue (provided)
src/core/         pure logic: counting, writing, editing patterns   ← phase 1, 5.3
src/parse/        the pattern text parser                          ← phase 2
src/client/       the React app                                    ← phase 3 and 5
src/server/       the Express API                                  ← phase 4
solutions/        reference solutions (peek only after trying)
curriculum/       the syllabus that drives the checklist
```

## Reading a failing test
```
FAIL  1.2 expand > repeats a stitch n times
Error: Exercise 1.2 is not built yet          ← still a stub: write the code
AssertionError: expected [ 'sc' ] to deeply equal [ 'sc', 'sc', 'sc' ]   ← your code ran, but returned the wrong thing
```
`expected` is what the test wanted; `received` (or the first value) is what you returned.

## Seeing your work in the browser
`npm run dev` starts the API (port 3001) and the web app (http://localhost:5173). You do not have to finish anything first:

* A feature whose exercise is still a stub shows a purple **"Waiting for exercise X"** card telling you what to build.
* Finish the exercise and, when you save, the card turns into the real feature.
* Until you build the API client and data hook (5.1, 5.2), charts are saved in your browser (`localStorage`). A note at the top of the page says so.
* Saving a plain `.ts` file can make the page reload, which drops unsaved edits in the editor. Press **Save** in the app first if it matters.

## Your first exercise
Open `exercises/phase-0-setup/0.1-first-green/README.md` and do it.

## Checkpoint
* In your own words: what are the three colours of the loop, and what does each one tell you?
* Which command runs only the tests for exercise 1.2?
* Why shouldn't you edit the test files?
