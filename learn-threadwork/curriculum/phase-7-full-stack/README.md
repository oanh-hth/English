# Phase 7: Full stack: connect the app to the server

**Goal:** A typed API client, sync decisions and an async login form.

## Why this phase
The client and server work on their own. Now they talk: sign in, load your data, save changes a moment after you stop typing, and handle the case where you edited on two devices.

## Learn
1. **`fetch` in the browser.** `await fetch(url, { method, headers, body: JSON.stringify(data) })`. `fetch` only rejects on network failures; a 404 or 500 still resolves, so check `res.ok`.
2. **A typed client.** Wrap `fetch` once (headers, token, errors) and expose small typed methods: `api.login()`, `api.getState()`. Components never build URLs.
3. **Custom error classes.** `class ApiError extends Error { status }` lets callers react to 401 or 409 specifically.
4. **Async UI states.** Idle → waiting (button disabled, "Please wait…") → success or an error message. Always re-enable after an error.
5. **Debounce.** Wait until changes stop before saving, so typing a title sends one request, not twenty.
6. **Sync with timestamps.** Each side remembers when it last saved (`savedAt`) and when both sides last agreed (`lastSyncedAt`). Comparing the three tells you to push, pull, do nothing, or ask the user.
7. **Optimistic concurrency.** The client sends the version it based its change on (`baseSavedAt`); the server answers 409 if someone saved since. Nobody's work is silently overwritten.
8. **Dev proxy.** In development Vite forwards `/api` to the Node server (see `vite.config.ts`), so the browser talks to one origin.

## Read
- Using fetch (MDN): https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- Vite server proxy: https://vite.dev/config/server-options.html#server-proxy
- Debounce explained: https://developer.mozilla.org/en-US/docs/Glossary/Debounce
- HTTP 409 Conflict: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/409

## Exercises
Do them in order; later exercises use earlier ones.

| # | Exercise | You edit |
|---|---|---|
| [7.1](7.1-api-client.md) | A typed API client | `app/client/src/api/client.ts` |
| [7.2](7.2-sync.md) | Sync decisions and debounce | `app/shared/sync.ts` |
| [7.3](7.3-login-form.md) | LoginForm with loading and errors | `app/client/src/components/LoginForm.tsx` |

Start with `npm run ex 7.1`. When an exercise passes, commit it and run `npm run progress`.

## Knowledge check
Tick each box (change `[ ]` to `[x]`) when you can explain it in your own words. `npm run progress` counts them.

- [ ] I can wrap fetch in a typed client with good error messages
- [ ] I can explain why fetch resolves on HTTP errors and how to handle it
- [ ] I can show waiting and error states in an async form
- [ ] I can explain debounce and where the app uses it
- [ ] I can explain push, pull and conflict using savedAt and lastSyncedAt
- [ ] I can run the full app (`npm run dev`), create an account and see changes saved on the server
