# 4.3 · The REST API

**Concepts:** Express app, middleware order, route parameters, status codes, error-handling middleware, testing HTTP without opening a port (supertest).

**Prerequisites:** 4.1 and 4.2.

**File to edit:** `src/server/routes.ts`

## What to build
`createApp(repo)` returns an Express app with the routes listed in the comment above the function. It must *not* call `listen`. `src/server/index.ts` (provided) does that, so your tests can run the app in-process.

## Things to notice
* Order matters: the catch-all `/api` 404 goes **after** the real routes, and error-handling middleware (four arguments) goes last.
* A 404 for a missing chart and a 400 for bad input are different problems and the client will treat them differently (exercise 5.1).
* A 500 must never expose the real error message to the client.

## Try it by hand
`npm run dev:server`, then `curl localhost:3001/api/health`.

## Done when
`npm run learn test 4.3` is green. Milestone of phase 4: the API answers `curl`.
