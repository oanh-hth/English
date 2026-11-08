# Phase 5: The HTTP API

**Goal:** validate input with zod and build REST routes with Express, then test them with real HTTP requests.
**You build:** request validation, the library/item/series routes and the upload/file routes.
**Time:** about 4 to 6 hours.

## Learn first

### 1. REST in one minute
A URL names a *thing*, the method says what to do with it:
| Request | Meaning |
|---|---|
| `GET /api/library` | read |
| `POST /api/series` | create |
| `PATCH /api/media/:id` | change some fields |
| `DELETE /api/series/:id` | delete |
| `PUT /api/uploads/:id/data` | send the bytes of a file |
Status codes tell the result: 200 ok, 201 created, 400 bad input, 401 not signed in, 403 forbidden, 404 not found, 413 too big, 415 wrong type, 416 bad range.

### 2. Validate every input
A request body is *untrusted*. With [zod](https://zod.dev) you describe the allowed shape once:
```ts
const schema = z.object({ title: z.string().max(200).optional(), ids: z.array(z.string()).min(1) });
const result = schema.safeParse(body);  // { success, data } or { success: false, error }
```
Unknown fields are dropped. Then the rest of the code can trust the types.

### 3. Express routers
```ts
const router = Router();
router.get('/library', (req, res) => { res.json({ ... }); });
router.patch('/media/:id', (req, res) => { req.params.id; req.body; });
```
`app.use('/api', router)` puts them under `/api`. `requireAuth` already ran, so `req.session!.userId` is the signed-in user. Docs: https://expressjs.com/en/guide/routing.html

### 4. Errors in routes
Throw `new HttpError(404, 'Not found')` in a synchronous route. In an `async` route, wrap the handler in `asyncHandler(...)` (Express 4 does not catch rejected promises by itself). One `errorHandler` (given) sends `{ "error": "..." }`.

### 5. Thin routes, smart repositories
A route should: validate, call a repository or service, answer. All the *rules* live in phases 3 and 4. If a route grows an `if` that is a business rule, it probably belongs in a repository.

### 6. Testing HTTP with supertest
`server/test-support/context.ts` (given) builds the real app with an in-memory database and a fake storage, and gives you signed-in "agents":
```ts
const ctx = createTestContext();
const res = await ctx.as(ctx.alice).patch('/api/media/abc').send({ title: 'x' });
expect(res.status).toBe(200);
```
You are testing the whole stack from the HTTP request down to the database. Docs: https://github.com/ladjs/supertest

### 7. Streaming files in and out
`await pipeline(req, new SizeGuard(size), fs.createWriteStream(tmp))` saves an upload without holding it in memory; `fs.createReadStream(path, { start, end }).pipe(res)` sends a slice. Write to a temporary `.part` file and `rename` when complete, so a crash never leaves a half file under the real name.

## Self-check
1. Why validate in the route when the repository also rejects bad ids?
2. What is the difference between 401 and 403? Between 404 for "does not exist" and 404 for "not yours"? (Why answer the *same* for both?)
3. Why wrap async handlers in `asyncHandler`?
4. Why upload to `.part` and `rename`?
5. What does `Accept-Ranges: bytes` tell the browser?

## Exercises
Phase 5 builds on phases 2 to 4. Do those first, or the route tests will fail for *their* reasons.

### 5.1 Validate requests  (`server/src/http/validation.ts`)
**Builds:** the front door of the API. Replace each `z.any()` with a real schema, and write `parseBody`. Use `.refine()` for custom rules (valid date, no repeated ids).

### 5.2 Library, item and series routes  (`server/src/http/routes/library.ts`)
**Builds:** `GET /library`, edit/delete an item, create/edit/delete a series. The comment above `libraryRouter` lists each route, status and message.
<details><summary>Hint: INVALID_IDS</summary>

`SeriesRepo` throws `new Error('INVALID_IDS')`. Write a small helper that calls a function in `try/catch` and turns that one error into `new HttpError(400, message)`; let every other error pass through.
</details>

### 5.3 Upload and file routes  (`server/src/http/routes/uploads.ts`)
**Builds:** announce, send, complete, and the file route that serves the **original** (whole, sliced, or redirected to a cloud link).
Build and test in this order: `POST /uploads`, `POST /uploads/:id/complete`, `PUT /uploads/:id/data`, then `GET /media/:id/file`.

## Finished the phase?
`npm run progress`, tick the manual boxes. **Stretch:** add `GET /api/media/:id` returning one item, with tests.
