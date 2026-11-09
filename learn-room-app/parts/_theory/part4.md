The rules work, but only from the terminal. Now we put them behind an HTTP API so a browser (or anything else) can use them. This part is plain Node.js with Express: no UI.

## a) Layers

```
HTTP request ──► app.ts (routes: parse + validate)  ──► domain/*.ts (rules, pure)
                         │
                         └──► store.ts (data) ──► fileStore.ts (disk)
```

Each layer knows only the one below. The domain does not know HTTP exists; the store does not know about Express. That is why you could write the domain first and test it with no server.

## b) A repository class with defensive copies

`ItemStore` keeps an array and hands out **copies**. If it returned its own objects, any caller could change the store's data without going through `update()`. It also calls an `onChange` callback after each real change: `main.ts` plugs file saving into it, tests plug in nothing. The store never imports `fs`.

## c) Async file I/O

`fs/promises` functions return promises: `await readFile(path, 'utf8')`.

- A missing file on the *first run* is normal: return an empty list.
- A corrupt file is **not** normal. Returning an empty list would make the next save overwrite the user's data. Throw instead.
- **Atomic write:** write `items.json.tmp`, then `rename` it over `items.json`. Rename is atomic on one file system, so a crash can never leave half a file.

## d) Validate at the edge with zod

Everything from the network is `unknown`. A zod schema checks the shape *and* gives you the TypeScript type:

```ts
const schema = z.object({ name: z.string().trim().min(1), qty: z.number().int().min(1).optional() });
type Body = z.infer<typeof schema>;      // { name: string; qty?: number }
schema.parse(req.body);                  // returns the cleaned data, or THROWS ZodError
```

Unknown keys are dropped, which also protects you from clients sending `{ "id": "..." }` or `{ "price": 0 }` to a route that must not change them.

## e) HTTP in one table

| Status | Meaning | Used here |
|---|---|---|
| 200 | OK | reads, PATCH |
| 201 | Created | POST /items |
| 204 | OK, no body | DELETE |
| 400 | Your request is wrong | validation errors |
| 404 | No such thing | unknown id or route |
| 500 | My bug | unexpected errors |

Express 5 forwards errors thrown in route handlers (even async ones) to the **error middleware**: a function with four parameters `(err, req, res, next)` registered last. One place turns `ZodError` into a 400 with a list of problems.

## f) Testing without a port

`supertest(app).get('/api/items')` calls the Express app directly in memory. The clock and id generator are injected (`today`, `newId`), so tests are deterministic.
