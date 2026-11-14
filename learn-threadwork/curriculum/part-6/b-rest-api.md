# Part 6b: A REST API

*[Part 6: A Node.js server](README.md) · section b*

A **REST API** organises a server around things (resources) and the four basic actions on them. In this section you build one for tasks. The finished app syncs its whole state instead (6d), but REST is the most common API style you'll meet, and building one teaches routing, validation and status codes properly.

## Resources and methods

| Request | Means | Success |
|---|---|---|
| `GET /api/tasks` | list tasks | 200 + array |
| `GET /api/tasks/:id` | one task | 200 + task, or 404 |
| `POST /api/tasks` | create | 201 + the new task |
| `PUT /api/tasks/:id` | replace | 200 + the task |
| `DELETE /api/tasks/:id` | delete | 204, no body |

`:id` is a **route parameter**; Express gives it to you as `req.params.id`.

## Routers

Group related routes in a `Router` and mount it at a path:

```ts
export function tasksRouter(repo: TaskRepo): Router {
  const r = Router();
  r.get("/", async (req, res) => { res.json(await repo.list()); });
  return r;
}
// in index.ts: app.use("/api/tasks", tasksRouter(repo));
```

## Dependency injection

The router doesn't create its storage; it receives a `repo`. In tests that's an in-memory repo; on the real server it could be files or a database. The router doesn't care. Passing dependencies in is what makes every server piece in this course testable.

## Never trust the request body

The body is whatever someone sent. Validate it with your `parseTask` from 1.4 and answer `400` with the error message. A `PUT` must also make sure the id in the body matches the URL. Otherwise someone could "update" task 1 with task 2's data.

## Async handlers in Express 4

Express 4 doesn't notice when an `async` handler's promise fails. The request would hang forever. Catch the error and pass it to `next`, which sends it to your error handler:

```ts
const wrap = (fn) => (req, res, next) => { fn(req, res).catch(next); };
r.get("/", wrap(async (req, res) => { res.json(await repo.list()); }));
```

## Read more
- REST (MDN glossary): <https://developer.mozilla.org/en-US/docs/Glossary/REST>
- Express Router: <https://expressjs.com/en/guide/routing.html#express-router>
- Express and async errors: <https://expressjs.com/en/guide/error-handling.html#catching-errors>

---

## Exercises 6.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 6.2: A REST API for tasks

**Edit:** `app/server/src/routes/tasks.ts` · **Tests:** `tests/part-6/6.2-tasks-api.test.ts` · **Run:** `npm run ex 6.2`

Write `tasksRouter(repo)` with the five routes, validation via `parseTask`, the right status codes, and async errors passed to `next`.

---

[← 6a Node.js and Express](a-express.md) · [6c Accounts and protected routes →](c-accounts.md)
