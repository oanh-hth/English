# Learn to build Threadwork

A self-paced course in **TypeScript, React and Node.js**, in the style of [Full Stack Open](https://fullstackopen.com). You build **Threadwork**, a todo list that remembers what you learned:

- every task is **simple** (just tick it) or **complex**;
- when you finish a complex task you write down the **result** and your **decision**, and file it under a **web development category** (HTML, CSS, Layout, Accessibility, React, State management, Performance, Testing, Node.js, APIs, Deployment…);
- the **decision log** lets you filter everything you've decided by group, category or text, and export it as Markdown.

The course is split into **parts**, and each part into **sections**. A section teaches the ideas you need, with examples from Threadwork, and ends with **exercises** that build the next piece of the app. Most exercises have tests that tell you when you're done. **When you finish the last exercise, Threadwork is finished**, deployed and on your iPad's home screen.

## Parts

| Part | What it covers | Sections | Exercises |
|---|---|---|---|
| **[Part 0: Fundamentals](curriculum/part-0/README.md)** | How the course works, the tools you need, and how a web app like Threadwork fits together: browser, server, data. | [0a](curriculum/part-0/a-how-this-course-works.md) · [0b](curriculum/part-0/b-how-threadwork-works.md) | 0.1–0.3 |
| **[Part 1: TypeScript and the task model](curriculum/part-1/README.md)** | TypeScript through Threadwork's data: tasks, outcomes and the category list. Types, unions, records, immutable updates, generics and validating data from outside. | [1a](curriculum/part-1/a-types-and-objects.md) · [1b](curriculum/part-1/b-unions-and-records.md) · [1c](curriculum/part-1/c-immutable-updates.md) · [1d](curriculum/part-1/d-generics-and-unknown.md) | 1.1–1.4 |
| **[Part 2: The app's logic: dates, a reducer and queries](curriculum/part-2/README.md)** | The app's logic as pure functions: dates, one reducer for every change, and the queries behind the decision log and the weekly summary. | [2a](curriculum/part-2/a-pure-functions-and-dates.md) · [2b](curriculum/part-2/b-reducers.md) · [2c](curriculum/part-2/c-queries.md) | 2.1–2.4 |
| **[Part 3: React components](curriculum/part-3/README.md)** | React components: the task row, quick capture, the task list, and the outcome form where a complex task gets its result, decision and category. | [3a](curriculum/part-3/a-components-and-props.md) · [3b](curriculum/part-3/b-state-and-forms.md) · [3c](curriculum/part-3/c-lists-and-composition.md) · [3d](curriculum/part-3/d-the-outcome-form.md) | 3.1–3.4 |
| **[Part 4: State, hooks and navigation](curriculum/part-4/README.md)** | One state for the app: custom hooks, saving on the device, useReducer and Context, navigation between pages, and debounced search. After this part the real app runs. | [4a](curriculum/part-4/a-custom-hooks.md) · [4b](curriculum/part-4/b-reducer-and-context.md) · [4c](curriculum/part-4/c-navigation-and-search.md) | 4.1–4.4 |
| **[Part 5: The decision log](curriculum/part-5/README.md)** | The decision log: filter by group, category and text, decision cards, the page that combines them, and an export to Markdown. | [5a](curriculum/part-5/a-filters.md) · [5b](curriculum/part-5/b-decision-cards.md) · [5c](curriculum/part-5/c-the-decision-log.md) · [5d](curriculum/part-5/d-export.md) | 5.1–5.4 |
| **[Part 6: A Node.js server](curriculum/part-6/README.md)** | A Node.js server with Express: a REST API, accounts with safe passwords and tokens, and data saved in files with conflict checks. | [6a](curriculum/part-6/a-express.md) · [6b](curriculum/part-6/b-rest-api.md) · [6c](curriculum/part-6/c-accounts.md) · [6d](curriculum/part-6/d-storage.md) | 6.1–6.4 |
| **[Part 7: Full stack and shipping](curriculum/part-7/README.md)** | Full stack and shipping: the API client, sync between devices, sign-in, offline support, installing on the iPad and deploying. | [7a](curriculum/part-7/a-api-client.md) · [7b](curriculum/part-7/b-sync.md) · [7c](curriculum/part-7/c-sign-in.md) · [7d](curriculum/part-7/d-offline-and-ipad.md) · [7e](curriculum/part-7/e-deploy.md) | 7.1–7.6 |

33 exercises: 29 with automatic tests, 4 you tick yourself (like installing on the iPad). Plan on 25–40 hours if these tools are new to you.

## Start

You need Node.js 20 or newer (<https://nodejs.org>) and git.

```
cd learn-threadwork
npm install
```

Then read [Part 0a: How this course works](curriculum/part-0/a-how-this-course-works.md).

## Commands

| Command | What it does |
|---|---|
| `npm run ex <n>` | Shows exercise *n* (where to read, what to edit) and runs its tests every time you save. `npm run ex next` picks the first unfinished one; `npm run ex` lists them all. |
| `npm run progress` | Your checklist: exercises done, knowledge checks ticked. Writes [PROGRESS.md](PROGRESS.md). |
| `npm run dev` | Runs the server (port 3001) and the app (<http://localhost:5173>). Parts waiting for an exercise say which one. |
| `npm test` | Every test, in watch mode. |
| `npm run typecheck` | TypeScript checks the whole project. |
| `npm run build` then `npm start` | The production app: one server for the app and the API on port 3001, with offline support. |
| `npm run verify` | For whoever maintains the course: every solution passes, every starter fails. |

## The repository

```
app/shared/     TypeScript used by the browser and the server: the data model, categories, rules and queries
app/client/     the React app: your components, plus the given pages (views/) and app shell (App.tsx)
app/server/     the Node.js + Express server
tests/          one test file per exercise; don't change them, they are the specification
curriculum/     the course: a folder per part, a file per section, and course.json
solutions/      reference answers, for when you're really stuck
scripts/        the ex, progress and verify commands
```

## Categories

The category list is in `app/shared/categories.ts`: 21 frontend topics, 6 backend and 7 workflow. Tasks store the category **id**, so you can rename a category without breaking saved decisions. Add your own topics to the list whenever something is missing.

## Rules that help

- **Go in order.** Later exercises use earlier ones. Every exercise passes using only the work before it.
- **Don't change the tests.** If one seems wrong, re-read the starter file's comment.
- **Commit after every green exercise:** `git add -A && git commit -m "Finish 3.4"`.
- **Look at `solutions/` last.** Read, close, then write your own.
- **Use the app while you build it.** Each choice you make during the course is a good entry for your own decision log.

## Data and privacy

The server keeps accounts and app state as JSON files in `data/` (ignored by git). Passwords are stored as salted scrypt hashes. Set `TOKEN_SECRET` in production; otherwise one is created in `data/secret.txt`.
