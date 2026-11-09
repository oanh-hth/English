# Part 2: Showing the library

Time for a real app. By the end of this part, a Node server reads photos from a database and from disk, and a React page shows them as a scrapbook: tiles grouped by year, series as stacks, with search and a filter.

You will learn how a **server** answers requests (Express, REST), how data lives in **SQLite**, how to **serve files** safely (and let videos seek), and the first steps of **React**.

- [a) A server in five minutes](#a-a-server-in-five-minutes)
- [b) Data in SQLite](#b-data-in-sqlite)
- [c) Files on disk](#c-files-on-disk)
- [d) The routes](#d-the-routes)
- [e) React: showing the library](#e-react-showing-the-library)
- [Self-check](#self-check) · [Run the app](#run-the-app)

> Until part 6 the app has no sign-in: the server uses a pre-made "dev" user (`server/src/auth/strategies.ts`, read it). Every query still carries a user id, so adding real sign-in later changes nothing in your routes.

---

## a) A server in five minutes

**Express** is a small library for writing HTTP servers. A server is a list of *routes*; each route says "when a request like this arrives, run this function":

```ts
import express from 'express';

const app = express();
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello' });        // status 200 and a JSON body
});
app.listen(3000);
```

`req` is the request (`req.params`, `req.body`, `req.headers`), `res` is the response you build (`res.json`, `res.status(404)`, `res.set(header)`). Docs: [Express routing](https://expressjs.com/en/guide/routing.html).

### REST: URLs name things, methods say what to do

| Request | Meaning |
|---|---|
| `GET /api/library` | read the library |
| `PATCH /api/media/42` | change some fields of item 42 |
| `DELETE /api/media/42` | delete it |

Status codes say how it went: `200` ok, `201` created, `400` bad input, `401` not signed in, `404` not found, `416` bad byte range.

### Routers and middleware

A **router** groups routes; `app.use('/api', libraryRouter(...))` mounts them. **Middleware** is a function `(req, res, next)` that runs *before* the routes and either answers or calls `next()`. Open `server/src/app.ts` (given) and read it top to bottom: the security headers, the JSON parser, sign-in, then the routers. It receives everything it needs as **arguments** (`config`, `db`, `storage`, `auth`) instead of creating it. This is *dependency injection*, and it is why tests can build the same app with a throw-away database.

### Testing a server without a browser

`supertest` sends real HTTP requests to your Express app inside the test:

```ts
const res = await request(app).get('/api/library');
expect(res.status).toBe(200);
```

`server/test-support/context.ts` (given) builds the app with an in-memory database and gives you signed-in test users: `ctx.as(ctx.alice).get('/api/library')`.

---

## b) Data in SQLite

A **database** keeps data after the program stops. **SQLite** is a database in one file, built into Node (`node:sqlite`). Open `server/src/db/schema.ts` (given): `media` has one row per photo or video, `series` one row per series, `users` one per account.

You talk to it in **SQL**:

```sql
SELECT * FROM media WHERE user_id = ? AND status = 'ready' ORDER BY position, created_at;
UPDATE media SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?;
DELETE FROM media WHERE id = ? AND user_id = ?;
```

```ts
db.prepare('SELECT * FROM media WHERE id = ?').get(id);       // one row, or undefined
db.prepare('SELECT * FROM media WHERE user_id = ?').all(uid);  // an array
db.prepare('DELETE FROM media WHERE id = ?').run(id);          // returns { changes }
```

### Never paste values into SQL

Always use `?` placeholders. Building `"... WHERE id = '" + id + "'"` allows **SQL injection**: someone sends `' OR 1=1 --` as the id and reads everything. Placeholders make that impossible.

### Ownership is a `WHERE`

Every query that touches one item also checks `user_id`. That is the whole reason Alice cannot open Bob's photo even if she guesses its id. The tests try exactly that.

### Repositories

A **repository** is a class that owns the SQL for one kind of thing, so the rest of the app calls `media.listReady(userId)` and never sees a `SELECT`. It also converts `taken_on` (SQL style) to `takenOn` (our TypeScript types).

### Exercise 2.1: Media repository

> **File:** `server/src/db/mediaRepo.ts` · **Test:** `npm run ex -- 2.1`
> **Builds:** reading, editing and deleting photo records, per user. (It also has the "pending upload" methods you will use in part 4.)

Write a small `toItem(row)` function first and reuse it everywhere.

<details><summary>Hint: update with partial changes</summary>

Read the current row (`findReady`), then write all four fields back using `patch.title ?? current.title`. The `??` operator picks the right side only when the left side is `undefined` or `null`.
</details>

---

## c) Files on disk

The photos themselves are not in the database (a database is for small structured data). They are **files**, and the database only remembers a random file name, the *storage key*.

### One contract, two backends

Open `server/src/storage/types.ts` (given). The `Storage` interface lists what the app needs from "somewhere to keep files": `head(key)`, `readHead(key, n)`, `remove(key)`... The routes only know this interface, so today we store on disk, and in part 7 you will write a cloud driver without touching a single route. This is *programming to an interface*.

### Never trust a path

If a key could be `../../etc/passwd`, the server would read or write outside its folder (*directory traversal*). `createLocalStorage` therefore allows only keys that match a strict pattern, and refuses everything else.

```ts
import fs from 'node:fs/promises';
await fs.stat(path);                    // { size }; throws with code 'ENOENT' when the file does not exist
const handle = await fs.open(path, 'r');
await handle.read(buffer, 0, n, 0);
await handle.close();
```

Always `await` file calls (they do not block the server) and close what you open (`try`/`finally`). Docs: [Node fs](https://nodejs.org/api/fs.html).

### Exercise 2.2: Local file storage

> **File:** `server/src/storage/localStorage.ts` · **Test:** `npm run ex -- 2.2`

Write `localPath(key)` first and use it in every other method.

### Byte ranges: how videos seek

A video player does not download 2 GB to jump to minute 40. It asks for a slice: `Range: bytes=1000-1999`. The server answers `206 Partial Content` with just those bytes. Both ends are *included*. The three shapes are `a-b`, `a-` (to the end) and `-n` (the last n bytes). Read [MDN: Range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests).

### Exercise 2.3: Byte ranges

> **File:** `server/src/http/range.ts` · **Test:** `npm run ex -- 2.3`

A pure function, so quick to test. Handle every invalid case in the table in the comment.

---

## d) The routes

Now connect the pieces to HTTP. A route should do three things: validate, call a repository, answer. All the *rules* already live in the repositories.

Serving a file adds two new ideas. **Streaming**: `fs.createReadStream(path, { start, end }).pipe(res)` sends the file in small chunks, so a 2 GB video never sits in memory. And **async handlers**: Express 4 does not catch rejected promises, so wrap an `async` route in `asyncHandler(...)` (given in `errors.ts`).

### Exercise 2.4: Library and file routes

> **Files:** `server/src/http/routes/library.ts` and `files.ts` · **Test:** `npm run ex -- 2.4`
> **Builds:** `GET /api/library` and `GET /api/media/:id/file`.

The first is three lines. The file route follows the numbered recipe in its comment: redirect for cloud storage, otherwise stream the whole file or a slice.

---

## e) React: showing the library

**React** builds interfaces from *components*: functions that return what the screen should look like.

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello {name}</h1>;
}
```

JSX looks like HTML but is JavaScript; `{ }` inserts a value. React **escapes** inserted text, so a title like `<img onerror=...>` appears as harmless text and can never run. (Never use `dangerouslySetInnerHTML` for text a user wrote.)

- **Props** are a component's inputs. In TypeScript you declare them: `interface LibraryProps { library: Library; onOpenItem: (id: string) => void }`. Function props (callbacks) are how a child tells its parent something happened.
- **State** is memory: `const [query, setQuery] = useState('')`. Changing it re-renders. A **controlled input** shows a state value and updates it in `onChange`.
- **Lists** need a stable `key`: `{items.map((i) => <li key={i.id}>{i.name}</li>)}`.

Read the first chapters of [react.dev/learn](https://react.dev/learn) (*Describing the UI* and *Adding Interactivity*).

### The browser's side of the conversation

Components do not call `fetch` directly. We put it in one place, the **API client**: it sends JSON, adds the CSRF header you will meet in part 6, and turns error answers into a typed `ApiError`. Tests then give it a fake `fetch`.

### Exercise 2.5: API client

> **File:** `web/src/api/client.ts` · **Test:** `npm run ex -- 2.5`

No React here: plain TypeScript around `fetch`.

### Exercise 2.6: Library view

> **File:** `web/src/components/Library.tsx` · **Test:** `npm run ex -- 2.6`
> **Builds:** the scrapbook page: search box, filter, year headings, tiles, stacks.

Your `buildEntries` and `groupByYear` from part 1 do the thinking; the component only turns the result into HTML and wires the search and filter to state. Tests find things the way a person would (by role and text), not by CSS class. Docs: [Testing Library queries](https://testing-library.com/docs/queries/about).

<details><summary>Hint: structure</summary>

State for `query` and `kind`; `const groups = groupByYear(buildEntries(library, { query, kind }))`; then `groups.map(...)` renders a `<section aria-label={group.year}>` with an `<h2>`, and inside it `group.entries.map(...)` renders one `<button>` per entry. Split a `Tile` component out so the code stays readable.
</details>

---

## Self-check

1. What is the difference between a route and middleware?
2. What is SQL injection, and what exactly prevents it here?
3. Why does every query include `user_id`?
4. Why is `Storage` an interface? What would you change to move to cloud storage?
5. What does `bytes=-500` ask for? What status does the server answer?
6. What makes a component re-render? Why do list items need a `key`?

## Run the app

Everything is in place for a first look. Seed some sample photos and start both servers (two terminals):

```bash
npm run seed -w server        # 8 sample photos and a series for the "dev" user, files written to ./data
npm run dev:server            # API on http://127.0.0.1:3000
npm run dev:web               # app on http://localhost:5173
```

Open <http://localhost:5173>. You should see a scrapbook with real images, grouped by year, a stack for "Hanoi trip", and a search box that filters while you type (try `crab`). Clicking a photo opens a dialog with the picture and a `TODO` where the note editor will go: that is part 3.

Tick the manual boxes in `CHECKLIST.md` and run `npm run progress`.

**Stretch:** add a `limit` query parameter to `GET /api/library` and a test.
