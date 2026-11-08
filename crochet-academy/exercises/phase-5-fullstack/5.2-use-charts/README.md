# 5.2 · A data hook

**Concepts:** custom hooks, `useState`, `useEffect` with cleanup, `useCallback`, loading/ready/error states, avoiding updates after unmount.

**Prerequisite:** 5.1 (the `ApiClient` type; the tests use a fake client, so your own 5.1 code is not needed to pass).

**File to edit:** `src/client/hooks/useCharts.ts`

## What to build
`useCharts(api)` gives a component everything it needs to show the server's charts: the list, a `status`, an `error` message, and `create` / `remove` / `refresh` actions that keep the list in step with the server.

Rules worth reading twice:
* a failed `create` or `remove` must **not** change the list, and must **reject** so the caller can show the error;
* functions returned by the hook keep the same identity between renders, so effects depending on them do not re-run forever.

## See it
`npm run dev`: the "My charts" page uses your hook. Stop the server and refresh to see the error state.

## Done when
`npm run learn test 5.2` is green.
