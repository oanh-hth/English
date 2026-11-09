# Part 9a: Talking to the server

*[Part 9: Full stack and shipping](README.md) · section a*

The browser app and the server both work. Now they talk. In this section you write the **API client**, the one place where the app turns "log in" or "save my state" into HTTP requests.

## `fetch` in the browser

```ts
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
```

The important surprise: **`fetch` only rejects when the network fails.** A 401 or a 500 still *resolves*. Always check `res.ok` yourself.

## One request function, many small methods

Put everything that every request needs in one function: JSON headers, the token, error handling. Then each API call is one line:

```ts
async function request<T>(method: string, path: string, body?: unknown): Promise<T> { /* … */ }

return {
  login: async (email, password) => (await request<{ token: string }>("POST", "/api/auth/login", { email, password })).token,
  getState: <T,>() => request<Saved<T>>("GET", "/api/state"),
  // …
};
```

Components never build URLs or read status codes. They call `api.login(...)`.

## Errors people can understand

Turn every failure into an `ApiError` with a status and a readable message:

- network down → `status 0`, "Can't reach the server. Check your connection."
- the server sent `{ error: "…" }` → use that message (your server writes them for people)
- anything else, an HTML error page for example → "Request failed (500)"

```ts
class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
```

Callers can then react to specific cases: `if (err.status === 409)` means "changed on another device".

## Testing without a server

The client takes `fetchFn` as an option. Tests pass a function that returns a ready-made `Response`, so they can check exactly what was sent and simulate any reply. That's dependency injection again, now on the client.

## The dev proxy

In development, the app runs on port 5173 and the server on 3001. Vite forwards every `/api` request to the server (see `vite.config.ts`), so the app can use simple paths like `/api/state`. In production the server serves both, on one port.

## Read more
- Using Fetch (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch>
- `Response.ok` (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Response/ok>
- Vite server proxy: <https://vite.dev/config/server-options.html#server-proxy>

---

## Exercises 9.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 9.1: A typed API client

**Edit:** `app/client/src/api/client.ts` · **Tests:** `tests/part-9/9.1-api-client.test.ts` · **Run:** `npm run ex 9.1`

Write `createApi({ baseUrl, fetchFn, getToken })` with one shared request function and the six methods. The tests check headers, bodies, URLs and every kind of error.

---

[← Part 9 overview](README.md) · [9b Syncing two devices →](b-sync.md)
