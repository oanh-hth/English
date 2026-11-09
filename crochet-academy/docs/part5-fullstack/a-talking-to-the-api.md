# 5a · Talking to the API

Until now the editor kept its charts in the browser. To use your server, the front end needs a **client**: one place that knows the URLs and how to read the answers. Components should never call `fetch` directly; they call `api.list()` and `api.create(chart)`.

## `fetch` and `async` / `await`
```ts
const response = await fetch('/api/charts');
const charts = await response.json();
```
`fetch` returns a promise of a `Response`; `response.json()` returns a promise of the parsed body. Both need `await`.

Important: **`fetch` does not throw on 404 or 500**. It only rejects when the network itself fails (offline, DNS). A 404 is a successful HTTP exchange with a bad answer. So you must check `response.ok` yourself:

```ts
if (!response.ok) throw new ApiError(response.status, messages);
```

## One `request` function
The four methods differ only in path, HTTP method and body. Put the shared work in one private function and make the methods one-liners:

```ts
async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetchFn(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  ...
}

return {
  list: () => request<Chart[]>('/api/charts'),
  create: (input) => request<Chart>('/api/charts', 'POST', input),
  ...
};
```

## Generics
`request<T>` is a **generic function**: `T` stands for "the type of the data we expect back". `request<Chart[]>(...)` returns a `Promise<Chart[]>`. Be aware that the type is a **promise you make**, not something TypeScript can verify: the compiler cannot look inside a network answer. That is exactly why part 4 validated everything on the server.

## Errors with meaning
A custom error class carries what the UI needs:
```ts
class ApiError extends Error {
  constructor(public readonly status: number, public readonly messages: string[]) {
    super(messages.join('; '));
    this.name = 'ApiError';
  }
}
```
The server's 400 answers contain `{ errors: [...] }`, the 404s contain `{ error: '...' }`, and a crashed proxy might return an HTML page that is not JSON at all. The client must cope with all three: read the JSON inside a `try`, and fall back to `` `Request failed (${status})` ``. A network failure (the `fetch` promise rejects) is a *different* kind of problem, so let that error pass through unchanged.

Some answers have **no body**: a successful `DELETE` returns 204. Calling `response.json()` on it would throw, so check the status first.

## Injecting `fetch`
`createApiClient(fetchFn = fetch, baseUrl = '')` takes `fetch` as a parameter. In the app it is the real one. In tests you pass a fake that returns canned `Response` objects, so the tests run in milliseconds, need no server and are completely repeatable. Another use of dependency injection, as in the repository.

## What the app can do now
After 5.1 **and** 5.2 (next section), the app uses your client instead of browser storage. Until both are green a note at the top of the page says charts are saved in the browser.

## Exercises 5.1.

| | | file you edit |
|---|---|---|
| **5.1** [A typed API client](../../exercises/part5-fullstack/5.1-api-client/README.md) | `fetch`, generics, custom errors | `src/client/api/client.ts` |

Next: [5b · Data hooks](b-data-hooks.md).
