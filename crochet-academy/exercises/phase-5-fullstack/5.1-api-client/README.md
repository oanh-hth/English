# 5.1 · A typed API client

**Concepts:** `fetch`, `async/await`, generics (`request<T>`), custom `Error` classes, passing dependencies in (the fake `fetch` the tests give you).

**File to edit:** `src/client/api/client.ts`

## What to build
`createApiClient(fetchFn, baseUrl)` returns `{ list, create, update, remove }`. Each call hits one of your phase 4 routes. If the server answers with an error, throw an `ApiError` that carries the status and a list of human-readable messages, so the UI can show them.

Put the shared logic into one private `request<T>(path, method, body)` function and make the four methods one-liners.

## Why pass `fetchFn` in?
The tests give you a fake `fetch` that returns canned `Response` objects. No server needed, no network, instant and repeatable.

## Done when
`npm run learn test 5.1` is green.
