# Part 3: Node, Express and REST

**Goal.** Replace json-server with your own TypeScript server that stores notes in memory, validates input, handles errors properly and calls the weather service for you. The database arrives in Part 4.

**You will learn:** Node.js modules and scripts, Express 5, REST design, middleware, validation with zod, environment variables, calling another API from a server.

Work in `word-garden/backend`.

## a. Node and TypeScript on the server

**Node.js** runs JavaScript outside the browser. A **server** is a program that listens on a port and answers HTTP requests. **Express** is a small library that routes requests to functions.

Set up:

```bash
cd backend
npm init -y && npm pkg set type=module
npm i express zod
npm i -D typescript tsx @types/node @types/express
npx tsc --init
```

`tsconfig.json` essentials: `"target": "ES2022"`, `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`, `"strict": true`, `"outDir": "dist"`, `"rootDir": "src"`. With `NodeNext`, import your own files **with the `.js` extension** (`import { x } from './x.js'`), even though the source is `.ts`. It looks odd and is how Node's ESM works.

Scripts: `"dev": "tsx watch src/index.ts"`, `"build": "tsc"`, `"start": "node dist/index.js"`.

```ts
// src/app.ts
import express from 'express';
export const app = express();
app.use(express.json());                       // parse JSON bodies
app.get('/api/health', (_req, res) => { res.json({ ok: true }); });
```

```ts
// src/index.ts
import { app } from './app.js';
const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`Listening on ${port}`));
```

Splitting `app` from `listen` is important: tests (Part 10) import `app` without opening a port.

**Environment variables** configure a program without changing its code: `PORT`, `DATABASE_URL`, `JWT_SECRET`. Read them in one `config.ts` file, validate them at start-up (fail fast if one is missing) and never print secrets. In development load a `.env` file with `node --env-file=.env` or the `dotenv` package.

### Exercises

**3.1.** Create the backend as above. `npm run dev` must serve `GET /api/health` returning `{ "ok": true }`. Check with `curl -i`.

**3.2.** Create `src/config.ts` that reads `PORT` and exports a typed config object. Make it throw a clear error if a required variable is missing (use a required `NODE_ENV`-independent one such as `DATABASE_URL` for now, with a default only for development).

**3.3.** Implement the notes API **in memory** (an array): `GET /api/notes`, `POST /api/notes`, `GET /api/notes/:id`, `PUT /api/notes/:id`, `DELETE /api/notes/:id`. Use the right status codes: `201` on create, `204` on delete, `404` for a missing id.

**3.4.** Point the front end's Vite proxy at port 3001 instead of json-server. Everything from Part 2 should still work. Commit.

## b. REST, middleware and validation

**REST** means treating things as **resources** with URLs and using HTTP methods for the verbs. `/api/notes` is the collection, `/api/notes/42` one note. Return JSON, use status codes correctly, and keep URLs as nouns. For actions that are not CRUD, a sub-resource is clean: `POST /api/notes/42/reviews` creates a review.

**Middleware** is a function `(req, res, next)` that runs before your route. Express runs them in the order you register them. `express.json()` is middleware. So is a request logger, and so are error handlers.

**Never trust the client.** Validate every request body before using it. **zod** describes the shape once and gives you both a runtime check and a TypeScript type:

```ts
import { z } from 'zod';
export const NewNote = z.object({
  kind: z.enum(['phrase', 'word']),
  text: z.string().trim().min(1).max(200),
  meaning: z.string().trim().max(500).default(''),
  example: z.string().trim().max(500).default(''),
  note: z.string().trim().max(500).default(''),
});
export type NewNote = z.infer<typeof NewNote>;
```

**Errors.** In **Express 5**, if an async route handler throws or rejects, the error is passed to your error-handling middleware automatically (in Express 4 you needed a helper library). An error handler has four parameters and goes last:

```ts
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) return res.status(400).json({ error: 'Invalid input', details: err.flatten() });
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  console.error(err);                                  // log the details...
  res.status(500).json({ error: 'Something went wrong' });   // ...but never send them to the client
});
```

### Exercises

**3.5.** Add the zod schema above and validate `POST` and `PUT` bodies. Invalid input returns `400` with a helpful message.

**3.6.** Create `HttpError` (with a status) and the central error-handling middleware. A thrown `HttpError(404, 'Note not found')` must come out as `404 { "error": "Note not found" }`. Add an `unknownEndpoint` middleware for `/api/*` returning `404`.

**3.7.** Reject a duplicate note text (ignoring case) with `409 Conflict` and a clear message.

**3.8.** Add `GET /api/notes?q=&kind=` search and filter on the server.

**3.9.** Add request logging (write your own 5-line middleware that prints method, URL, status and time taken after the response finishes, or use `morgan`). Do not log request bodies: they may hold passwords later.

**3.10.** Split the code into `routes/notes.ts`, `middleware/errors.ts` and `app.ts` with an Express `Router`. In production the server should also serve the built front end: add `express.static` for `frontend/dist` and a catch-all that returns `index.html` for non-API paths, so the app works at one URL.

## c. Calling another API: the weather proxy

Your server will fetch weather from Open-Meteo and return it to the browser. Why not call Open-Meteo from the browser? **Privacy** (you choose what is sent), **caching** (one call serves many users), **resilience** (you decide what happens when it is down) and **control** (you can change provider without touching the front end).

```ts
const r = await fetch(url, { signal: AbortSignal.timeout(4000) });   // never wait forever
if (!r.ok) throw new HttpError(502, 'Weather service unavailable');
const j = await r.json() as { current: { weather_code: number; is_day: number; temperature_2m: number } };
```

A **timeout** on every outgoing call is not optional: without one a slow service can hold your server's connections open until it falls over.

Map the numeric **WMO weather code** to a friendly condition (table in `app-spec.md`) in a pure function `condFromCode(code: number): Cond`, and test it.

**Rate limiting** protects your server and the free service: `express-rate-limit` allows N requests per minute per client IP.

### Exercises

**3.11.** Write `condFromCode` in `src/weather/cond.ts` with a test table covering every range in the spec, including an unknown code (return `'cloudy'`).

**3.12.** Implement `GET /api/weather?lat=&lon=`. Validate both numbers with zod (`-90..90`, `-180..180`), **round them to 2 decimals** before calling Open-Meteo, and return `{ cond, isDay, tempC }`.

**3.13.** Add the 4-second timeout and turn upstream failures into `502`. Test it by pointing the URL at a closed port.

**3.14.** Add `express-rate-limit` to the weather route (20 requests a minute) and confirm you get `429` after that with a loop of `curl` calls.

**3.15.** Add a simple in-memory cache (a `Map` keyed by the rounded coordinates) with a 30-minute lifetime. Explain in `NOTES.md` what is wrong with an in-memory cache when you run two servers. (In Part 8 you will move it to the database.)

## Checkpoint 3

- [ ] The front end talks to your Express server, with no json-server.
- [ ] Every route validates input and uses correct status codes, and errors never leak stack traces.
- [ ] `condFromCode` is tested. The weather endpoint has a timeout, rounding and a rate limit.
- [ ] `npm run build && npm start` serves both the API and the built front end on one port.

Tag it: `git tag part3`.
