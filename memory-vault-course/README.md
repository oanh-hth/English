# Build Memory Vault: a full-stack course (React, TypeScript, Node.js)

A course in the style of [Full Stack Open](https://fullstackopen.com): you learn by building **one real app** over several **parts**. Each part has reading material that teaches the ideas you need, then exercises that build the next slice of the app. **Every exercise has tests you must make pass**, and a **checklist** that ticks itself. When you finish the last part, you have the finished app.

**Memory Vault** is a private, login-only scrapbook for photos and videos in original quality, with notes, series (albums) and secure sign-in.

## The seven parts

| Part | Material | You build | After it, the app can... |
|---|---|---|---|
| [1](course/part-1-typescript.md) | TypeScript, pure functions, testing | text utilities, the library's search/group logic | print a text scrapbook (`npm run demo`) |
| [2](course/part-2-showing-the-library.md) | Express, REST, SQLite, files, byte ranges, React basics | media repository, file storage, library and file routes, API client, library view | **show your library** with real images, search and filter |
| [3](course/part-3-writing-notes.md) | validation with zod, PATCH/DELETE, forms in React, XSS | validation, edit/delete routes, note editor | **write notes** on a memory |
| [4](course/part-4-uploading.md) | magic bytes, the upload workflow, streams, file inputs | file sniffing, upload service and routes, upload panel | **upload** photos and videos |
| [5](course/part-5-series.md) | data modelling, transactions, lists in state, effects | series repository and routes, series mode, series reader | group photos into **series** and flip through them |
| [6](course/part-6-accounts.md) | password hashing, sessions, cookies, CSRF, lockout | hashing, sessions, lockout, auth middleware and routes, login form | **sign in** (before this, everyone is a pre-made "dev" user) |
| [7](course/part-7-finishing.md) | security headers, signed URLs, integration testing | security headers, cloud storage driver, capstone | be hardened and proven end to end |

28 exercises in all. Each part's material is a text to read from top to bottom, with small sections (a, b, c...) and the exercises placed right where the idea was just explained. Expect roughly one to two evenings per part.

## Before you start
- **Node.js 22.9 or newer** (`node -v`). SQLite comes with Node.
- Basic JavaScript (variables, functions, arrays, objects). TypeScript, React, Express and SQL are taught as you need them.
- An editor (VS Code recommended) and a terminal.

```bash
cd memory-vault-course
npm install
npm run progress        # 0 / 28 at the start: every piece is still an empty stub
```

Then open [part 1](course/part-1-typescript.md).

## How an exercise works

1. **Read the material** of the part up to the exercise.
2. **Open the stub file.** Files marked `// EXERCISE x.y` throw `Not implemented`. Their comment says exactly what to build and where the feature shows up in the app. Read the **test file** too: it is the precise specification.
3. **Run its tests** and make them pass:
   ```bash
   npm run ex -- 2.1            # run once
   npm run ex -- 2.1 --watch    # re-run on every save
   ```
4. **Update your checklist:** `npm run progress` runs every test and rewrites [`CHECKLIST.md`](CHECKLIST.md). Exercise boxes tick themselves. Manual boxes (read the material, answer the self-check questions, **run the app**) are yours: change `[ ]` to `[x]`; they are kept.
5. **Finish with the app.** Each part ends with a "Run the app" section: you start the real app and *use* what you built, so every part has a visible result.

### Commands
| Command | What it does |
|---|---|
| `npm run ex -- <id>` | tests of one exercise (`--watch` to keep running) |
| `npm run progress` | all tests; updates `CHECKLIST.md` and shows what is next |
| `npm test` | every test |
| `npm run typecheck` | check TypeScript in all three packages |
| `npm run demo` | part 1: a text scrapbook built with your functions |
| `npm run seed -w server` | part 2: sample photos for the app |
| `npm run dev:server` / `npm run dev:web` | run the real app (API on :3000, web on :5173) |
| `npm run solution -- <id>` | list the reference solution files (`--show` to read, `--apply` replaces your work) |

### Stuck?
1. Read the failing test: it shows the exact input and the expected output.
2. Read the hints (`<details>` blocks) and the official docs linked in the text.
3. Only then peek: `npm run solution -- 2.1 --show`. Close it and write the code again from memory.

> Do the parts **in order**. Later exercises use your earlier code (the upload service uses your file sniffer and media repository). If a later test fails strangely, check the earlier exercises are green.

## Project map

```
memory-vault-course/
├── CHECKLIST.md          your progress (generated; tick the manual boxes yourself)
├── course/               the material: part-1-... to part-7-... (+ curriculum.ts, the course map)
├── shared/               code used by BOTH server and web (src/, tests/, scripts/demo.ts)
├── server/               Node.js + Express API
│   ├── src/              auth/, db/, storage/, uploads/, http/ (+ routes/), app.ts, main.ts
│   ├── tests/            one test file per exercise
│   ├── test-support/     fake storage, in-memory database, signed-in test users (given)
│   └── scripts/          create-user, seed (given)
├── web/                  React + Vite app (src/api, components, hooks, App.tsx, styles)
├── solutions/            reference solutions, one folder per exercise (no peeking!)
└── scripts/              the tools behind the commands above
```

**Given vs. yours.** Files starting with `// EXERCISE x.y` are yours. Everything else (types, database schema, app wiring, `App.tsx`, styles, test helpers, `strategies.ts`) is provided and worth reading: it shows how your pieces connect. Some files grow over several parts (`validation.ts`, `UploadPanel.tsx`, `media.ts`): the comments say which part adds what.

## Design notes
- **Vertical slices.** Like Full Stack Open, every part touches both the server and the browser and ends with something you can run, instead of building all the backend first.
- **Tests as specifications.** A fake clock, fake storage and an in-memory database make every test fast and reliable, and teach dependency injection.
- **Security is a theme.** Hashing, sessions, CSRF, ownership checks, validation, file-type sniffing, path safety and CSP each have a test that attacks them.
- **Cloud storage.** Part 7 builds the driver against an interface. Connecting it to a real bucket is a deployment task (the reference app `memory-vault/src/storage.js` shows the AWS SDK adapter).

## For maintainers
- `npm run verify:solutions` puts every reference solution in place, runs all 28 exercises, and restores the stubs. It must print "All reference solutions pass".
- `npm run verify:solutions -- --through=3` pretends a learner finished parts 1 to 3 only: those exercises must pass and the project must still typecheck. Run it for every part (1 to 6) after changing the course.
- With only stubs in place, `npm run progress` must show `0 / 28`.

Bundled fonts (Fredoka, Nunito, Caveat) are open source (SIL Open Font License), packaged via `@fontsource`.
