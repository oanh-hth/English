# Part 0a: How this course works

*[Part 0: Fundamentals](README.md) · section a*

Welcome. In this course you build **Threadwork**, a todo list that remembers what you learned.

Every task is either **simple** or **complex**. A simple task, like "reply to Minh", you just tick off. A complex task, like "choose how to lay out the board", ends with two things you write down: the **result** (what happened, what you found out) and your **decision** (what you chose, and why). Each decision goes into a **category**: a web development topic such as CSS, Layout, Accessibility, React, State management or Node.js. Later, the **decision log** lets you filter everything you've decided by topic. It's a personal record of how you work, and a study notebook that writes itself.

The course teaches **TypeScript, React and Node.js** by building that app, one piece at a time. When you finish the last part, the app is finished too, deployed, and on your iPad's home screen.

## How the course is organised

The course has eight parts. Each part is split into sections, like this one (0a). A section explains the ideas you need, with examples from Threadwork, and ends with **exercises**. The exercises are where you build the app.

| Part | You learn | You build |
|---|---|---|
| 0 | Tools, how web apps work | Your first passing test |
| 1 | TypeScript | Tasks, outcomes and the category list |
| 2 | Pure functions, reducers, queries | The app's logic, the decision log's filters, the weekly summary |
| 3 | React components | Task rows, quick capture, the task list, the outcome form |
| 4 | Hooks, Context, routing | Saving data, the app's state, pages, search |
| 5 | Composing components | The decision log: filters, cards, export |
| 6 | Node.js, Express | Accounts and saving on a server |
| 7 | Full stack | Sign-in, sync between devices, offline, iPad install, deploy |

## How an exercise works

Most exercises give you a **starter file** in `app/`. It already has the right function or component name, and a comment that describes exactly what it must do. Next to it is a **test file** in `tests/`. The tests are the full specification: when they all pass, the exercise is done.

```
npm run ex 1.2
```

This prints the exercise, then runs its tests every time you save a file. Red means "not yet". Each failing test shows what it **expected** and what your code **received**. That is your guide.

A few exercises have no tests, such as installing the app on the iPad. You tick those yourself in the section where they are described.

## Your checklist

```
npm run progress
```

This runs every test, reads the boxes you ticked, prints your progress and writes it to `PROGRESS.md`. Each part's README also has a **knowledge check**: a list of things you should be able to explain. Tick one only when you can explain it to someone else.

## The app is always running

You don't have to wait until the end to see Threadwork. The finished app's pages are already in the repository. Every part that depends on an exercise you haven't done yet says which exercise it's waiting for:

> **The task list** needs exercise 3.3. Run `npm run ex 3.3`.

As you finish exercises, the app fills in. There is also a **playground** at `http://localhost:5173/#playground` that shows your components with sample data.

## Tools you need

- **Node.js 20 or newer** from <https://nodejs.org> (choose LTS). Check with `node -v`.
- **Git**, to save your work step by step. Check with `git --version`.
- **An editor.** VS Code (<https://code.visualstudio.com>) understands TypeScript out of the box.
- A browser. On the iPad, Safari.

Then, in this folder:

```
npm install
```

## Rules that help

- **Don't change the tests.** If you think a test is wrong, re-read the comment in the starter file.
- **Go in order.** Later exercises use your earlier code: the reducer in Part 2 calls the functions from Part 1.
- **Commit after every green exercise:** `git add -A && git commit -m "Finish 2.2"`.
- **Use the solutions last.** `solutions/` has a reference answer for every exercise. Read it only after a real try, close it, and write your own version.
- **Use the app while you build it.** Every decision you make during this course (why `useReducer`, why a REST API…) is a good first entry in your own decision log.

---

## Exercises 0.1–0.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 0.1: Make your first test pass

**Edit:** `app/shared/hello.ts` · **Tests:** `tests/part-0/0.1-hello.test.ts` · **Run:** `npm run ex 0.1`

Make the first test pass, to try the loop you will use in every exercise.

1. Run `npm run ex 0.1`. Two tests fail: `greet` throws `"TODO 0.1"`.
2. Open `app/shared/hello.ts` and make `greet("Oanh")` return `"Hello, Oanh!"`. A template literal does it: `` `Hello, ${name}!` ``.
3. Save. The tests run again and turn green.
4. Commit, then run `npm run progress` and see your first tick.

### 0.2: Run the app and open the playground


Start the whole app with `npm run dev`. This starts the Node server on port 3001 and the React app on <http://localhost:5173>. Open the app: the sign-in screen is waiting for exercise 7.3. Click **Use without the server**: the app now says it is waiting for exercise 4.2. Then open <http://localhost:5173/#playground> and look at the components you're going to build. Press `Ctrl+C` to stop.

This exercise has no automatic tests. Tick it when you've done it (change `[ ]` to `[x]`), and `npm run progress` counts it:

- [ ] **0.2** Run the app and open the playground

---

[← Part 0 overview](README.md) · [0b How a web app like Threadwork works →](b-how-threadwork-works.md)
