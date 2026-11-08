# 4.2 · A repository for charts

**Concepts:** classes in TypeScript (`private`, `readonly`), `Map`, dependency injection (the clock and `onChange` are passed in), defensive copying with `structuredClone`.

**File to edit:** `src/server/repository.ts`

## What to build
`ChartRepository` keeps charts in memory and offers `list`, `get`, `create`, `update`, `remove`.

Why a class with a tiny interface? The routes (4.3) only call these five methods. In 4.4 you will make the data survive restarts by saving it from `onChange`, and nothing else changes.

Why copies? If `get()` returned the stored object, any caller could modify your data without going through `update()`. The tests check this.

## Done when
`npm run learn test 4.2` is green.
