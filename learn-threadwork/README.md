# Learn by building Threadwork

A self-paced course in **TypeScript, React and Node.js**. You build Threadwork, a personal workspace with linked tasks, Apple Pencil sketching and a garden that grows when you finish work, one tested feature at a time.

Each phase has two parts:
1. **Learn:** a short lesson with the ideas, examples and links to the official docs, plus a knowledge checklist.
2. **Apply:** exercises in the real app. Each one has starter code, instructions in the code comments, and **tests you make pass**.

`npm run progress` runs every test, reads your ticked knowledge checks, and writes your checklist to [PROGRESS.md](PROGRESS.md).

## The path

| Phase | You learn | Exercises |
|---|---|---|
| **[0. Setup and your first test](curriculum/phase-0-setup/README.md)** | Install the tools, run the app, and make your first test pass. | [0.1](curriculum/phase-0-setup/0.1-hello.md) |
| **[1. TypeScript through the task model](curriculum/phase-1-typescript/README.md)** | Types, unions, type guards, immutable updates, generics and validating unknown data. | [1.1](curriculum/phase-1-typescript/1.1-task-model.md), [1.2](curriculum/phase-1-typescript/1.2-growth.md), [1.3](curriculum/phase-1-typescript/1.3-immutable-updates.md), [1.4](curriculum/phase-1-typescript/1.4-generics-and-validation.md) |
| **[2. Domain logic: dates, garden and rewards](curriculum/phase-2-domain-logic/README.md)** | Pure functions and reducers for streaks, plant growth, harvests, treats and badges. | [2.1](curriculum/phase-2-domain-logic/2.1-dates-and-streaks.md), [2.2](curriculum/phase-2-domain-logic/2.2-garden-reducer.md), [2.3](curriculum/phase-2-domain-logic/2.3-treats.md), [2.4](curriculum/phase-2-domain-logic/2.4-badges.md) |
| **[3. React components](curriculum/phase-3-react-components/README.md)** | JSX, props, state, events, lists, forms and accessible markup, tested like a user would use them. | [3.1](curriculum/phase-3-react-components/3.1-task-card.md), [3.2](curriculum/phase-3-react-components/3.2-quick-capture.md), [3.3](curriculum/phase-3-react-components/3.3-board.md), [3.4](curriculum/phase-3-react-components/3.4-task-drawer.md) |
| **[4. State management and hooks](curriculum/phase-4-state-and-hooks/README.md)** | Custom hooks, useReducer, Context, effects and timers. | [4.1](curriculum/phase-4-state-and-hooks/4.1-use-local-storage.md), [4.2](curriculum/phase-4-state-and-hooks/4.2-app-reducer.md), [4.3](curriculum/phase-4-state-and-hooks/4.3-app-context.md), [4.4](curriculum/phase-4-state-and-hooks/4.4-use-countdown.md) |
| **[5. Graphics and Apple Pencil](curriculum/phase-5-graphics-and-pencil/README.md)** | SVG from data, stroke geometry and pointer events with palm rejection. | [5.1](curriculum/phase-5-graphics-and-pencil/5.1-plant.md), [5.2](curriculum/phase-5-graphics-and-pencil/5.2-stroke-geometry.md), [5.3](curriculum/phase-5-graphics-and-pencil/5.3-sketch-reducer.md) |
| **[6. Node.js server with Express](curriculum/phase-6-node-server/README.md)** | HTTP, routing, REST, validation, password hashing, tokens, files and calling other APIs. | [6.1](curriculum/phase-6-node-server/6.1-express-app.md), [6.2](curriculum/phase-6-node-server/6.2-tasks-api.md), [6.3](curriculum/phase-6-node-server/6.3-auth.md), [6.4](curriculum/phase-6-node-server/6.4-file-store.md), [6.5](curriculum/phase-6-node-server/6.5-weather.md) |
| **[7. Full stack: connect the app to the server](curriculum/phase-7-full-stack/README.md)** | A typed API client, sync decisions and an async login form. | [7.1](curriculum/phase-7-full-stack/7.1-api-client.md), [7.2](curriculum/phase-7-full-stack/7.2-sync.md), [7.3](curriculum/phase-7-full-stack/7.3-login-form.md) |
| **[Capstone](curriculum/capstone.md)** | Put it all together, bring back the prototype's features, use it on your iPad | checklist |

28 exercises in total. Expect roughly 30 to 50 hours if you are new to these tools.

## Start
You need Node.js 20 or newer (https://nodejs.org) and git.
```
cd learn-threadwork
npm install
npm run ex 0.1          # lesson + tests for the first exercise, re-run on every save
```
Then read [Phase 0](curriculum/phase-0-setup/README.md).

## Commands
| Command | What it does |
|---|---|
| `npm run ex <id>` | Shows the exercise (lesson, files, tests) and runs its tests on every save. `npm run ex next` picks the first unfinished one. Add `-- --once` to run once. |
| `npm run progress` | Your checklist: exercises passed, knowledge checks ticked, capstone items. Writes `PROGRESS.md`. |
| `npm test` | All tests in watch mode. |
| `npm run dev` | Runs the server (port 3001) and the app (http://localhost:5173) together. |
| `npm run typecheck` | TypeScript checks the whole project. |
| `npm run build` then `npm start` | One server that serves the built app and the API on port 3001. |
| `npm run verify` | For the course maintainer: checks that every solution passes and every starter fails. |

## How the repository is organised
```
app/
  shared/        TypeScript used by both sides: the task model, garden rules, sync rules
  client/        React app (Vite). App.tsx, the playground and SketchPad are given; the components are yours
  server/        Node.js + Express API. index.ts is given; app, auth, routes and storage are yours
tests/           one test file per exercise (don't edit; they are the specification)
curriculum/      lessons: a README per phase, a page per exercise, the capstone and course.json
solutions/       reference solutions, only for when you are stuck
scripts/         the ex, progress and verify commands
```
The app runs from the start. Every part that depends on an unfinished exercise shows which exercise it is waiting for. Try your components with sample data at http://localhost:5173/#playground.

## Rules that help
- **Don't change the tests.** If a test seems wrong, re-read the comments in the starter file first.
- **One exercise at a time, in order.** Later exercises import earlier ones (for example 4.2 uses your code from Phases 1 and 2).
- **Commit after every green exercise.** `git commit -am "Finish 2.2"`.
- **Look at `solutions/` last.** Read it, close it, and write your own version.
- **Tick knowledge checks honestly.** Tick one only when you can explain it to someone else.

## Data and privacy
The server stores accounts and app state as JSON files in `data/` (ignored by git). Passwords are stored as salted scrypt hashes. The token secret is created on first start in `data/secret.txt`, or set it with `TOKEN_SECRET`. Weather comes from Open-Meteo (free, no key); only coordinates are sent.
