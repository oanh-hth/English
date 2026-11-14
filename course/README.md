# Build Word Garden: a full stack course

This course teaches you to build a complete, deployed, full stack web app from an empty folder: **React and TypeScript** on the front, **Node.js and Express** on the back, and a **PostgreSQL relational database** underneath. It follows the format of [Full Stack Open](https://fullstackopen.com): numbered **parts**, each split into **lessons** (a, b, c) with **exercises** at the end of every lesson. All exercises add to the **same project**, so when you finish you own the finished app, with users, a database, tests, CI and a live URL.

The app you build is **Word Garden**: a notebook for the English you pick up, with spaced review, active practice and a plant that grows as you study. Read [`app-spec.md`](app-spec.md) first.

## The stack

| Layer | Tools | Where you learn it |
|---|---|---|
| Language | TypeScript everywhere | Parts 1, 3 |
| Front end | React, Vite, React Router, TanStack Query, plain CSS | Parts 1, 2, 7, 8 |
| Back end | Node.js 22, Express 5, zod, bcrypt, JSON Web Tokens | Parts 3, 6 |
| Database | PostgreSQL 16, SQL, Sequelize, Umzug migrations | Parts 4, 5 |
| Browser APIs | Speech synthesis, MediaRecorder, Geolocation, service worker | Parts 8, 9, 11 |
| Testing | Vitest, supertest, Testing Library, MSW, Playwright | Part 10 |
| Delivery | Docker, GitHub Actions, Render | Part 11 |

It mirrors Full Stack Open's route (React, Node, TypeScript, then a relational database with Sequelize and migrations, then testing and CI/CD), with one change: you meet the database before auth, and you test with a real PostgreSQL rather than mocks.

## The parts

| Part | Title | By the end the app can... |
|---|---|---|
| [0](part0/README.md) | Getting ready | run on your machine, with a repo and a plan |
| [1](part1/README.md) | TypeScript and React: the Notes screen | show, filter and add notes in memory |
| [2](part2/README.md) | Forms, state and talking to a server | load and save notes through an HTTP API |
| [3](part3/README.md) | Node, Express and REST | serve its own API from a TypeScript server |
| [4](part4/README.md) | Relational databases, SQL and PostgreSQL | answer questions in SQL about real data |
| [5](part5/README.md) | Sequelize, migrations and the review scheduler | store notes in Postgres and schedule reviews |
| [6](part6/README.md) | Users and authentication | let people sign up and keep their own notes |
| [7](part7/README.md) | The full stack front end | log in, review flashcards and browse the schedule |
| [8](part8/README.md) | The garden: points, growth and weather | grow plants from points under a live weather sky |
| [9](part9/README.md) | Practice: sentences, voice and the daily mission | train writing, speaking and real-life use |
| [10](part10/README.md) | Testing | prove it works: API, components and end to end |
| [11](part11/README.md) | CI/CD, deployment and security | ship from GitHub to a public URL |
| [12](part12/README.md) | Going further | grow it in a direction you choose |

Plan on **14 to 18 weeks at about 6 hours a week**. Parts 0 to 5 give you a working server and database. Part 7 gives you a usable app.

## How a part works

1. **Read the lessons in order.** Type the code yourself, do not paste it.
2. **Do the exercises as you go.** They are numbered by part (`5.3`, `5.4`, ...). Commit after each one with a clear message.
3. **Run the automated tests where the course gives you some.** `exercises/` holds starter code with failing tests for the pure logic (text helpers, scheduler, growth). Make them pass, then use that code in your app.
4. **Finish the checkpoint.** Each part ends with a checklist and a git tag (`git tag part5`). The app should run at every checkpoint.
5. **Compare with the reference.** Only after your own version works, read the matching files in the reference app listed in the part.

If an exercise is stuck for more than 30 minutes: re-read the lesson, then read the error message aloud, then look at the reference, close it, and write your own.

## What you need

- A computer (macOS, Windows with WSL2, or Linux), VS Code, Git and a GitHub account.
- Node.js 22, and Docker for the local PostgreSQL.
- An iPhone or iPad on the same Wi-Fi to test on a real device.
- Basic JavaScript (variables, functions, arrays, objects). No React, TypeScript or SQL needed.

## Files in this folder

- [`app-spec.md`](app-spec.md): what the finished app does, its data model, rules and API. Your contract for the whole course.
- [`PROGRESS.md`](PROGRESS.md): tick off exercises and checkpoints.
- `sample-data/`: `schema.sql` (the reference database design), `seed.sql` (demo rows for Part 4) and `notes.json` (20 real phrases and words).
- `docker-compose.yml`: a throwaway PostgreSQL for development (port 5432) and one for tests (port 5433).
- `exercises/`: starter code with **49 automated tests** for Parts 1, 5 and 8. Run `npm install && npm test` inside it.
- `solutions/`: reference answers for those. Look only after you have tried.

## The reference app

The repository root holds a finished **vanilla JavaScript** version of Word Garden that keeps everything in the browser (`index.html`, `core.js`, `srs.js`, `plants.js`, `weather.js`, `notebook.js`, `views.js`, `session.js`, `practice.js`). Run it with `python3 -m http.server 8123` and open `http://localhost:8123`. It is your **behaviour reference**, not your starting point. You build a new version with a real server and database in your own folder, so what you learn is how the pieces fit together.

## Ground rules

- Use your **own project folder** (`word-garden`), separate from this repository.
- **Never put a secret in git.** Passwords, JWT secrets and database URLs go in a `.env` file that `.gitignore` blocks. The passwords in `docker-compose.yml` are for your laptop only. Part 6 and Part 11 explain why in detail.
- Commit small and often. A project history of 150 small commits is a better portfolio than one big one.
