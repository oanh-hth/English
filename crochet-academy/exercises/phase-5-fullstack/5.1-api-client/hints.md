## Hint 1
```ts
async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetchFn(`${baseUrl}${path}`, { method, headers: ..., body: ... });
```
Only set the `Content-Type` header and `JSON.stringify` the body when there is a body.

## Hint 2
When `!response.ok`, read the JSON inside a `try { ... } catch {}`: an HTML error page makes `response.json()` throw. Build `messages` from `data.errors` (an array) or `data.error` (a string).

## Hint 3
`if (response.status === 204) return undefined as T;` before trying to parse a body that does not exist.
