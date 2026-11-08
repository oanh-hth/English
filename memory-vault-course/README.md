# Build Memory Vault: a self-paced course in React, TypeScript and Node.js

Learn by building a real app. **Memory Vault** is a private, login-only scrapbook for photos and videos in original quality, with notes, series (albums) and secure sign-in. You build it yourself, piece by piece, in **7 phases and 24 exercises**. Every exercise comes with **tests you must make pass**, and a **checklist** that ticks itself as you go.

```
Learn the idea  ->  read the exercise  ->  make the tests pass  ->  the feature exists in the real app
```

You start with a project where every piece is an empty stub that throws `Not implemented`. When you finish, you have a working full-stack app. The finished original lives in this repository's [`memory-vault/`](../memory-vault) folder (plain JavaScript), if you want to compare.

## What you will learn

| Phase | Topic | You build |
|---|---|---|
| 1 | **TypeScript** foundations | formatting and validation helpers, a file-type detector, the library's search/group logic |
| 2 | **Node.js**: accounts and sessions | password hashing, sessions, login lockout, the auth middleware |
| 3 | **SQLite** data | the media and series repositories (ownership, order, covers) |
| 4 | **Files and uploads** | local file storage, HTTP byte ranges, the upload workflow |
| 5 | **The HTTP API** (Express + zod) | request validation, library/series routes, upload and file routes |
| 6 | **React + TypeScript** | API client, login form, note editor, library view, upload panel, series reader |
| 7 | **Hardening and capstone** | security headers, a cloud-storage driver, end-to-end tests, run the real app |

Along the way: modules, generics, classes, async/await, streams, SQL, REST, testing with Vitest, supertest and Testing Library, authentication and common web security (CSRF, XSS, injection, directory traversal).

## Before you start
- **Node.js 22.9 or newer** (`node -v`). SQLite is built into Node, nothing else to install.
- Basic JavaScript (variables, functions, arrays, objects). You do **not** need to know TypeScript, React or Express yet: each phase teaches what it uses.
- A code editor (VS Code recommended) and a terminal.

```bash
cd memory-vault-course
npm install          # once
npm run progress     # see where you are (0 / 24 at the start)
```

## How the course works

1. **Read the phase lesson** in [`course/`](course): the knowledge you need, with links to the official docs, then self-check questions.
2. **Open the first exercise stub.** Its comment explains exactly what to build and where the feature appears in the app. Read the test file too: it is the precise specification.
3. **Run the tests** for that exercise:
   ```bash
   npm run ex -- 1.1            # run once
   npm run ex -- 1.1 --watch    # re-run every time you save
   ```
   Red means "not there yet", and the message tells you why. Go green.
4. **Check your progress** and tick the checklist:
   ```bash
   npm run progress
   ```
   This runs every test and rewrites [`CHECKLIST.md`](CHECKLIST.md). Exercise boxes tick themselves. The **manual** boxes (read the lesson, answer the questions, run the app) are yours to tick by hand: change `[ ]` to `[x]`; they are kept.
5. **Go in order.** Later phases use your earlier work (the upload service uses your file sniffer and media repository). If a later test fails oddly, check the earlier exercises are green.

### The commands
| Command | What it does |
|---|---|
| `npm run ex -- <id>` | run the tests of one exercise (`--watch` to keep running) |
| `npm run progress` | run all tests and update `CHECKLIST.md` |
| `npm test` / `npm run test:watch` | run every test |
| `npm run typecheck` | check TypeScript in all three packages |
| `npm run solution -- <id>` | list the reference solution files (`--show` prints them, `--apply` replaces your work) |
| `npm run dev:server`, `npm run dev:web` | run the real app (phase 7) |

### Stuck?
1. Read the failing test's message and the test itself: it shows the exact input and expected output.
2. Read the hints (`<details>` blocks) in the lesson, then the official docs linked there.
3. Only then peek: `npm run solution -- 2.1 --show`. Close it, and write it again from memory. Using `--apply` replaces your file, so keep a copy if you want to compare.

## Project map

```
memory-vault-course/
├── CHECKLIST.md          your progress (generated; tick the manual boxes yourself)
├── course/               the lessons: phase-1-typescript.md ... phase-7-capstone.md  (+ curriculum.ts, the course map)
├── shared/               code used by BOTH server and web (phase 1)
│   ├── src/              types.ts (given), text.ts, sniff.ts, library.ts  <- exercises
│   └── tests/
├── server/               Node.js + Express API
│   ├── src/              auth/, db/, storage/, uploads/, http/, routes/, app.ts, main.ts
│   │                     (files marked "EXERCISE" are yours; the rest is given: read it!)
│   ├── tests/            one test file per exercise
│   └── test-support/     fake storage, in-memory database and signed-in test agents (given)
├── web/                  React + Vite app
│   ├── src/              api/, components/, hooks/, App.tsx (given), styles.css (given)
│   └── tests/
├── solutions/            reference solutions, one folder per exercise (no peeking!)
└── scripts/              the tools behind the commands above
```

**Given vs. yours.** Files that start with `// EXERCISE x.y` are stubs for you to complete. Everything else (types, schema, the app wiring, `App.tsx`, styles, test helpers) is provided and worth reading: it shows how your pieces connect.

## Run the real app (after phase 7, or any time with the solutions)
```bash
VAULT_PASSWORD="at least 12 characters" npm run create-user -w server -- alice
npm run dev:server     # API on http://127.0.0.1:3000   (files and database go to ./data)
npm run dev:web        # app on http://localhost:5173
```
Open http://localhost:5173, sign in, upload photos, make a series, write notes.

## Notes on the design
- **Why tests first?** Each test file is a specification. Reading it before you code is a professional habit, and "make it green" gives quick, honest feedback.
- **Why in-memory fakes?** A fake clock, fake storage and an in-memory database make every test fast and reliable, and teach dependency injection.
- **Real R2?** Exercise 7.2 builds the cloud driver against an interface. Connecting it to an actual bucket is a deployment task (see the reference app's `memory-vault/src/storage.js`, which uses the AWS SDK).
- **Security is a theme, not an add-on:** hashing, sessions, CSRF, ownership checks, validation, file-type sniffing, path safety and CSP are each a small exercise with a test that attacks it.

## For maintainers
`npm run verify:solutions` puts every reference solution in place, runs all 24 exercises, then restores the stubs. It must always print "All reference solutions pass". With only the stubs in place, `npm run progress` must show `0 / 24`.

## Licence of included fonts
The bundled web fonts (Fredoka, Nunito, Caveat) are open-source (SIL Open Font License), packaged via `@fontsource`.
