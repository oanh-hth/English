# Phase 4 · The Node API

**Goal:** build the server that stores charts: validation, a repository, REST routes and saving to disk.

## 1. Never trust the network
Anything that arrives in a request is `unknown`. TypeScript will not let you read properties of `unknown`, which is helpful: it forces you to check first.
```ts
function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}
```
Validation has two jobs: reject bad data with messages a person can act on, and **rebuild** the good data from the fields you know about, so nothing unexpected is stored. Collect all errors instead of stopping at the first. (4.1)

## 2. Hide storage behind a small interface
The routes call `list / get / create / update / remove` and nothing else. Today the data is a `Map` in memory; in 4.4 it is also written to a file; tomorrow it could be a database. The routes would not change. That is the **repository pattern**. (4.2)

Two habits to learn here:
* **Dependency injection:** the clock (`now`) and the `onChange` callback are passed in. Tests give a fake clock, so results are predictable.
* **Defensive copies:** `structuredClone` on the way in and out, so callers cannot change stored data behind your back.

## 3. REST in five lines
| Method | Path | Meaning | Success |
|---|---|---|---|
| GET | /api/charts | list | 200 |
| POST | /api/charts | create | 201 |
| GET | /api/charts/:id | read one | 200 or 404 |
| PUT | /api/charts/:id | replace | 200, 400 or 404 |
| DELETE | /api/charts/:id | remove | 204 or 404 |

Status codes carry meaning: **400** = you sent something wrong, **404** = that thing does not exist, **500** = we broke. Clients (like exercise 5.1) react differently to each. (4.3)

## 4. Express middleware
A request passes through a chain of functions in the order you register them:
```ts
app.use(express.json());            // 1. parse JSON bodies
app.get('/api/charts', handler);    // 2. routes
app.use('/api', notFound);          // 3. anything under /api that no route handled
app.use((err, req, res, next) => …) // 4. errors (four parameters!)
```
Order matters. A catch-all placed too early swallows your real routes.

Build the app in a function that **returns** it (`createApp`) and does not listen on a port. Then tests can call it directly with supertest, with no network and no port clashes.

## 5. Files and async
```ts
import { readFile, writeFile, rename } from 'node:fs/promises';
const text = await readFile(file, 'utf8');
```
* `await` pauses the function, not the whole server.
* A missing file is an *expected* case: catch `error.code === 'ENOENT'`.
* **Atomic write:** write to `file.tmp`, then `rename` over the target. A crash mid-write leaves the old file intact.
* **Serialise async work:** if two saves run at once, the older may finish last and win. Chaining on a promise (`queue = queue.then(save)`) runs them one at a time, in order. (4.4)

## Pitfalls
* Forgetting `return` after sending a response, then sending a second one ("headers already sent").
* Letting an exception from a handler crash the process, or leaking its message to the client.
* Trusting `req.params.id` blindly. Here it is only a lookup key, but think about what it would do in SQL or a file path.
* `JSON.parse` without a `try`.

## Checkpoint (write answers in `notes/phase-4.md`)
1. Why is a request body typed `unknown` and not `any`?
2. What is the difference between a 400 and a 404, and who is "at fault" in each?
3. Why does the repository return copies?
4. What can go wrong if two saves run at the same time, and how does the promise chain fix it?
5. Why does `createApp` not call `listen`?

## Milestone
Start the API and try it by hand:
```bash
npm run dev:server                      # in one terminal
curl localhost:3001/api/health
curl -X POST localhost:3001/api/charts -H 'content-type: application/json' \
  -d '{"name":"Test","mode":"flat","rows":[]}'
curl localhost:3001/api/charts
curl -X DELETE localhost:3001/api/charts/<id-from-the-create-answer>
```
Stop the server, start it again, list the charts: they are still there (look in `data/charts.json`).

## Further reading
* Express guide: *Routing*, *Error handling* — https://expressjs.com/
* MDN: HTTP response status codes
* Node docs: `fs/promises`
