# Part 4: A Node.js backend

> Generated from `parts/_theory` and `curriculum.json` by `npm run docs`. Edit those, not this file.

**In this part:** Put the rules behind a REST API with validation and a JSON file for storage.

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

## Exercises 4.1-4.4

Work in `src/`, read the doc comment above each function (it is the specification), and read the tests: they are examples of how your code is used. Check with `npm run check <id>`. Hints are one command away: `npm run learn -- hint <id>`.

### 4.1 In-memory store

A tiny repository class that hands out copies and notifies when data changes.

* **Practice:** Classes, encapsulation and defensive copies
* **Edit:** `src/server/store.ts`
* **Tests:** `tests/part4/store.test.ts`
* **Run:** `npm run check 4.1`

<details><summary>Hints</summary>

1. Spread (`{ ...item }`) makes a shallow copy; items only hold primitives so that is enough.
2. Only call `emit()` when something actually changed.

</details>

### 4.2 Saving to a file

Load and save JSON with `fs/promises`. A missing file is fine on the first run; a broken file must NOT silently become an empty room.

* **Practice:** Async file I/O and atomic writes
* **Edit:** `src/server/fileStore.ts`
* **Tests:** `tests/part4/fileStore.test.ts`
* **Run:** `npm run check 4.2`

<details><summary>Hints</summary>

1. `error.code === 'ENOENT'` identifies a missing file.
2. Write to `path.tmp`, then `rename`: rename is atomic.

</details>

### 4.3 Validating requests with zod

Describe request bodies as zod schemas. The TypeScript type is derived from the schema, so they cannot drift apart.

* **Practice:** Never trust the network
* **Edit:** `src/server/schema.ts`
* **Tests:** `tests/part4/schema.test.ts`
* **Run:** `npm run check 4.3`

<details><summary>Hints</summary>

1. `z.enum` accepts a readonly tuple like CATEGORY_IDS.
2. `.optional()` makes a key optional; `.trim().min(1)` rejects blank names.

</details>

### 4.4 Express routes

Wire the domain functions into a REST API and test it with supertest, without opening a port.

* **Practice:** HTTP verbs, status codes, error middleware
* **Edit:** `src/server/app.ts`
* **Tests:** `tests/part4/app.test.ts`
* **Run:** `npm run check 4.4`

<details><summary>Hints</summary>

1. Let `schema.parse` throw; one error middleware turns ZodError into a 400.
2. Use 201 for create, 204 for delete (no body) and 404 for unknown ids.

</details>

## What your app can do now

A server that other programs (and soon your browser) can talk to. It uses the same data/items.json as the terminal.

```bash
npm run server   (then, in another terminal: curl localhost:3001/api/summary)
```

## Check yourself

Tick these with `npm run learn -- tick <id>` when you can honestly say yes.

- **4.m1** I ran the server and called it with curl
- **4.m2** I can explain what 200, 201, 204, 400 and 404 mean
- **4.m3** I can explain why validation lives at the edge (the route) and the domain trusts its types
- **4.m4** I can explain why `loadItems` rethrows errors other than 'file not found'
