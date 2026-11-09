# Learn to build Threadwork

A self-paced course in **TypeScript, React and Node.js**, in the style of [Full Stack Open](https://fullstackopen.com). You build **Threadwork**, a personal workspace for your iPad and computer: tasks you link together, notes, drafts and data tables, the resources you used, Apple Pencil sketches, and a garden that grows when you finish work.

The course is split into **parts**, and each part into **sections**. A section teaches the ideas you need, with examples from Threadwork, and ends with **exercises** that build the next piece of the app. Most exercises come with tests that tell you when you're done. **When you finish the last exercise, Threadwork is finished**, deployed, and on your iPad's home screen.

## Parts

| Part | What it covers | Sections | Exercises |
|---|---|---|---|
| **[Part 0: Fundamentals](curriculum/part-0/README.md)** | How the course works, the tools you need, and how a web app like Threadwork fits together: browser, server, data. | [0a](curriculum/part-0/a-how-this-course-works.md) · [0b](curriculum/part-0/b-how-threadwork-works.md) | 0.1–0.3 |
| **[Part 1: TypeScript and the task model](curriculum/part-1/README.md)** | TypeScript through Threadwork's task model: types, unions, records, immutable updates, generics and checking data from outside. | [1a](curriculum/part-1/a-types-and-objects.md) · [1b](curriculum/part-1/b-unions-and-records.md) · [1c](curriculum/part-1/c-immutable-updates.md) · [1d](curriculum/part-1/d-generics-and-unknown.md) | 1.1–1.4 |
| **[Part 2: Domain logic: streaks, garden and rewards](curriculum/part-2/README.md)** | The rules that make Threadwork motivating, written as pure functions and reducers: streaks, the growing garden, harvests, treats and badges. | [2a](curriculum/part-2/a-pure-functions-and-dates.md) · [2b](curriculum/part-2/b-reducers.md) · [2c](curriculum/part-2/c-rewards.md) | 2.1–2.4 |
| **[Part 3: React components](curriculum/part-3/README.md)** | React components: the task card, the quick-capture bar, the board and the task drawer. Props, state, forms, lists and effects, tested the way people use them. | [3a](curriculum/part-3/a-components-and-props.md) · [3b](curriculum/part-3/b-state-and-forms.md) · [3c](curriculum/part-3/c-lists-and-composition.md) · [3d](curriculum/part-3/d-effects-and-editing.md) | 3.1–3.4 |
| **[Part 4: State management and hooks](curriculum/part-4/README.md)** | One state for the whole app: custom hooks, useReducer, Context, saving on the device, navigation between pages, and the Today page. After this part the real app runs. | [4a](curriculum/part-4/a-custom-hooks.md) · [4b](curriculum/part-4/b-reducer-and-context.md) · [4c](curriculum/part-4/c-navigation-and-selectors.md) | 4.1–4.6 |
| **[Part 5: Linked work: notes, resources and the link map](curriculum/part-5/README.md)** | Threadwork's central idea, everything linked to tasks: notes, drafts, data tables, resources you used, and a map that draws it all. | [5a](curriculum/part-5/a-feature-reducers.md) · [5b](curriculum/part-5/b-editors.md) · [5c](curriculum/part-5/c-resources.md) · [5d](curriculum/part-5/d-link-map.md) | 5.1–5.7 |
| **[Part 6: Sketching with Apple Pencil](curriculum/part-6/README.md)** | Drawing with Apple Pencil: pressure, smooth strokes, palm rejection, undo, and sketches saved with your tasks. | [6a](curriculum/part-6/a-stroke-geometry.md) · [6b](curriculum/part-6/b-pointer-input.md) · [6c](curriculum/part-6/c-saving-sketches.md) | 6.1–6.4 |
| **[Part 7: The garden and motivation](curriculum/part-7/README.md)** | Motivation: the plant drawn in SVG, harvests and seeds, the treat shop, the inspiration wall, a sky that follows the weather, animation and badge celebrations. | [7a](curriculum/part-7/a-svg-plant.md) · [7b](curriculum/part-7/b-garden-and-treats.md) · [7c](curriculum/part-7/c-inspiration.md) · [7d](curriculum/part-7/d-weather-and-motion.md) | 7.1–7.9 |
| **[Part 8: A Node.js server](curriculum/part-8/README.md)** | A Node.js server with Express: a REST API, accounts with safe passwords and tokens, data saved in files with conflict checks, and live weather. | [8a](curriculum/part-8/a-express.md) · [8b](curriculum/part-8/b-rest-api.md) · [8c](curriculum/part-8/c-accounts.md) · [8d](curriculum/part-8/d-storage.md) · [8e](curriculum/part-8/e-external-apis.md) | 8.1–8.5 |
| **[Part 9: Full stack and shipping](curriculum/part-9/README.md)** | Full stack and shipping: the API client, sync between devices, sign-in, offline support, installing on the iPad and deploying. | [9a](curriculum/part-9/a-api-client.md) · [9b](curriculum/part-9/b-sync.md) · [9c](curriculum/part-9/c-sign-in.md) · [9d](curriculum/part-9/d-offline-and-ipad.md) · [9e](curriculum/part-9/e-deploy.md) | 9.1–9.6 |

52 exercises: 47 with automatic tests, 5 you tick yourself (like installing on the iPad). Plan on 40–60 hours if these tools are new to you.

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
| `npm run ex <n>` | Shows exercise *n* (where to read, what to edit) and runs its tests every time you save. `npm run ex next` picks the first unfinished one. `npm run ex` lists them all. |
| `npm run progress` | Your checklist: exercises done, knowledge checks ticked. Writes [PROGRESS.md](PROGRESS.md). |
| `npm run dev` | Runs the server (port 3001) and the app (<http://localhost:5173>). Pages waiting for an exercise say which one. |
| `npm test` | Every test, in watch mode. |
| `npm run typecheck` | TypeScript checks the whole project. |
| `npm run build` then `npm start` | The production app: one server for the app and the API on port 3001, with offline support. |
| `npm run verify` | For whoever maintains the course: every solution passes, every starter fails. |

## The repository

```
app/shared/     TypeScript used by the browser and the server
app/client/     the React app: your components, plus the given pages (views/) and app shell (App.tsx)
app/server/     the Node.js + Express server
tests/          one test file per exercise; don't change them, they are the specification
curriculum/     the course: a folder per part, a file per section, and course.json
solutions/      reference answers, for when you're really stuck
scripts/        the ex, progress and verify commands
```

## Rules that help

- **Go in order.** Later exercises use earlier ones. Every exercise passes using only the work before it.
- **Don't change the tests.** If one seems wrong, re-read the starter file's comment.
- **Commit after every green exercise:** `git add -A && git commit -m "Finish 4.3"`.
- **Look at `solutions/` last.** Read, close, then write your own.
- **Tick knowledge checks honestly**, only when you could explain the idea to a friend.

## Data and privacy

The server keeps accounts and app state as JSON files in `data/` (ignored by git). Passwords are stored as salted scrypt hashes. Set `TOKEN_SECRET` in production; otherwise one is created in `data/secret.txt`. Weather comes from Open-Meteo (free, no key); only coordinates are sent.
