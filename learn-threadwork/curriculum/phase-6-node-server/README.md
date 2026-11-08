# Phase 6: Node.js server with Express

**Goal:** HTTP, routing, REST, validation, password hashing, tokens, files and calling other APIs.

## Why this phase
To use Threadwork on your iPad and your computer, the data needs a home. You build a small Node.js server: accounts, a place to save the app state, and a weather endpoint.

## Learn
1. **HTTP basics.** A request has a method (GET, POST, PUT, DELETE), a path, headers and maybe a body. A response has a status code (200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 404 Not Found, 409 Conflict, 500, 502) and a body.
2. **Express.** `const app = express(); app.get("/api/health", (req, res) => res.json({ ok: true }));`. Middleware are functions that run in order: `app.use(express.json())` parses JSON bodies.
3. **Routers.** `Router()` groups routes and is mounted at a path: `app.use("/api/tasks", tasksRouter(repo))`.
4. **Errors.** An error middleware has four arguments `(err, req, res, next)`. Express 4 does not catch rejected promises from `async` handlers, so pass them to `next(err)`.
5. **Dependency injection.** Routers receive what they need (`repo`, `secret`, `fetchFn`) as arguments. Tests pass fakes; the real server passes real ones.
6. **Passwords.** Never store them. Store a slow, salted hash (`crypto.scrypt`) and compare with `timingSafeEqual`.
7. **Tokens.** After login the server signs a small token with an HMAC; the client sends it as `Authorization: Bearer <token>`. Changing the token breaks the signature.
8. **Files.** `fs/promises` (`readFile`, `writeFile`, `rename`). Write to a temp file and rename it, so a crash never leaves half a file. Clean user input before using it in a path.
9. **Calling other APIs.** `fetch` works in Node 20. Cache answers so you don't call the weather service on every request.
10. **Testing a server** with Supertest: `await request(app).get("/api/health")`, no real port needed.

## Read
- Node.js: Introduction to the fs module and fetch: https://nodejs.org/en/learn
- Express routing: https://expressjs.com/en/guide/routing.html
- Express error handling: https://expressjs.com/en/guide/error-handling.html
- HTTP status codes (MDN): https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- OWASP password storage: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- Supertest: https://github.com/ladjs/supertest

## Exercises
Do them in order; later exercises use earlier ones.

| # | Exercise | You edit |
|---|---|---|
| [6.1](6.1-express-app.md) | An Express app with health check and errors | `app/server/src/app.ts` |
| [6.2](6.2-tasks-api.md) | A REST API for tasks | `app/server/src/routes/tasks.ts` |
| [6.3](6.3-auth.md) | Password hashing, tokens and protected routes | `app/server/src/auth.ts` |
| [6.4](6.4-file-store.md) | Atomic file storage and the state API | `app/server/src/storage/fileStore.ts` |
| [6.5](6.5-weather.md) | Weather from Open-Meteo with a cache | `app/server/src/weather.ts` |

Start with `npm run ex 6.1`. When an exercise passes, commit it and run `npm run progress`.

## Knowledge check
Tick each box (change `[ ]` to `[x]`) when you can explain it in your own words. `npm run progress` counts them.

- [ ] I can describe a request and response and pick the right status code
- [ ] I can create an Express app with middleware, routers and an error handler
- [ ] I handle errors from async handlers in Express 4
- [ ] I can explain salted hashing and why passwords are never stored
- [ ] I can explain how a signed token proves who you are and why it can't be edited
- [ ] I write files atomically and never trust user input in file paths
- [ ] I can test an Express app with Supertest and injected fakes
