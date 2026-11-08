# 4.4 · Save to a file

**Concepts:** `fs/promises`, async/await, error codes (`ENOENT`), atomic writes (write a temp file, then rename), serialising async work with a promise chain.

**Prerequisite:** 4.2.

**File to edit:** `src/server/fileStore.ts`

## What to build
* `loadCharts(file)` – read the JSON list; a missing file is an empty list; a broken file is a clear error.
* `saveCharts(file, charts)` – write safely (temp file + rename).
* `createPersistentRepository(file)` – a `ChartRepository` that loads at startup and saves after every change.

## The tricky part
Changes can arrive faster than the disk answers. If two saves run at once, the *older* one might finish last and overwrite the newer data. Fix it by chaining every save onto the previous one:
`queue = queue.then(() => saveCharts(...))`. Then `whenSaved()` just returns `queue`.

## Try it
`npm run dev:server`, `curl -X POST ...`, stop the server, start it again: your chart is still there (see `data/charts.json`).

## Done when
`npm run learn test 4.4` is green.
