# 4b · The repository and the routes

Valid data needs somewhere to live and a way for clients to reach it. In this section we build both: the **repository** (the storage) and the **routes** (the HTTP API), and keep them separate.

## Hide storage behind a small interface
The routes only ever need five operations:

```ts
repo.list();             repo.get(id);
repo.create(input);      repo.update(id, input);       repo.remove(id);
```
Today the charts live in a `Map` in memory. In the next section they are also saved to a file. Later you might use SQLite or Postgres. If the routes only know these five methods, **none of them has to change**. This is the **repository pattern**: a small interface that hides where data lives.

## A class in TypeScript
```ts
export class ChartRepository {
  private readonly charts = new Map<string, Chart>();

  constructor(options: RepositoryOptions = {}) {
    this.now = options.now ?? Date.now;
  }

  get(id: string): Chart | undefined { ... }
}
```
* `private` hides a member from code outside the class; `readonly` forbids reassignment.
* The constructor receives its **dependencies**: the clock (`now`), the starting charts, an `onChange` callback. Passing them in, instead of reaching for `Date.now()` and the file system directly, is called **dependency injection**. It is why the tests can give a fake clock and know exactly what `updated` should be.
* `onChange?.(list)` calls the callback only if one was provided.

## Defensive copies
If `get()` returned the object stored in the map, any caller could change it without going through `update()`, and your data would change silently. So copy on the way **out** *and* on the way **in**, with `structuredClone`. The tests check both directions: modify the input after calling `create`, modify the result after calling `get`, and the stored chart must not change.

## REST and status codes
A REST API maps operations on a *resource* (charts) to HTTP methods and paths:

| Method | Path | Meaning | Answer |
|---|---|---|---|
| GET | `/api/charts` | list | 200 and the list |
| POST | `/api/charts` | create | **201** and the new chart, or 400 |
| GET | `/api/charts/:id` | read one | 200 or **404** |
| PUT | `/api/charts/:id` | replace | 200, 400 or 404 |
| DELETE | `/api/charts/:id` | remove | **204** (no body) or 404 |

The status code tells the client what happened. Remember the families: **2xx** success, **4xx** *you* (the client) did something wrong, **5xx** *we* (the server) broke. 400 means "your data is invalid" and 404 means "there is no such thing". Clients react differently to each, as you will see in part 5.

## Express in five lines
```ts
import express from 'express';
const app = express();
app.use(express.json());                                    // parse JSON bodies
app.get('/api/charts/:id', (req, res) => {
  const chart = repo.get(req.params.id);
  if (!chart) return void res.status(404).json({ error: 'Chart not found' });
  res.json(chart);
});
```
`:id` is a **route parameter**, available as `req.params.id`. Notice `return` before sending an error response: forgetting it lets the handler carry on and try to send a second response ("headers already sent").

## Middleware and order
A request travels through a chain of functions in the order you registered them: JSON parsing, then the routes, then a fallback for unknown `/api` paths, then error handling. Order matters. A catch-all registered too early swallows the real routes. A function with **four** parameters, `(err, req, res, next)`, is an **error handler**; body-parser marks invalid JSON with `err.type === 'entity.parse.failed'`, and the handler turns it into a clean 400. Any other error becomes a 500 with a generic message: never send an internal error message to the client.

## Build the app, don't start it
`createApp(repo)` **returns** the Express app and never calls `listen()`. `src/server/index.ts` (provided) is what starts the server. Because the function only builds the app, the tests can drive it directly with **supertest**, with no real network and no port clashes:
```ts
const res = await request(createApp(new ChartRepository())).post('/api/charts').send(body);
expect(res.status).toBe(201);
```

## Exercises 4.2.-4.3.

| | | file you edit |
|---|---|---|
| **4.2** [A repository for charts](../../exercises/part4-node/4.2-repository/README.md) | classes, `Map`, dependency injection, copies | `src/server/repository.ts` |
| **4.3** [The REST API](../../exercises/part4-node/4.3-routes/README.md) | Express, status codes, middleware order | `src/server/routes.ts` |

Next: [4c · Saving to disk](c-saving-to-disk.md).
