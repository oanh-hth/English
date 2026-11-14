# Part 6a: Node.js and Express

*[Part 6: A Node.js server](README.md) · section a*

So far Threadwork lives in one browser. To use it on your iPad **and** your computer, your data needs a home both can reach: a server. Part 6 builds it with **Node.js** and **Express**.

## Node.js

Node runs JavaScript (and, with the `tsx` tool, TypeScript) outside the browser. It can read files, listen for network requests and talk to other services. There's no `window` and no DOM, but there are modules like `node:fs` for files and `node:crypto` for passwords.

## HTTP in one paragraph

A **request** has a method (`GET` read, `POST` create, `PUT` replace, `DELETE` remove), a path (`/api/tasks/42`), headers (`Content-Type: application/json`, `Authorization: …`) and sometimes a body. A **response** has a status code (`200` OK, `201` Created, `204` No Content, `400` Bad Request, `401` not signed in, `404` Not Found, `409` Conflict, `500` server error), headers and a body.

## Express

Express makes a server out of small functions:

```ts
import express from "express";
const app = express();
app.use(express.json());                                  // parse JSON bodies
app.get("/api/health", (req, res) => { res.json({ ok: true }); });
app.listen(3001);
```

A **route** answers one method and path. **Middleware** (`app.use(fn)`) runs for every request, in the order you add them: parse the body, check the sign-in, log. **Order matters**, as you'll see with the 404 handler.

## Not found, and errors

Anything under `/api` that no route answered should get a JSON 404, not Express's default HTML page:

```ts
app.use("/api", (req, res) => { res.status(404).json({ error: "Not found" }); });
```

This goes **after** every route; otherwise it would answer first.

An **error handler** is middleware with four parameters. Express calls it when something throws:

```ts
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON" });
  console.error(err);                                     // details in the server log…
  res.status(500).json({ error: "Something went wrong" }); // …never in the response
});
```

Never send error details to the client. They can reveal how your server works.

## `createApp` without `listen`

`createApp()` builds the app but doesn't start listening. The given `index.ts` calls `listen`, and the tests use **Supertest**, which sends requests straight to the app without a real port:

```ts
const res = await request(createApp()).get("/api/health");
expect(res.body).toEqual({ ok: true });
```

`createApp(mount)` also takes a function that adds the other routers, so every part of the server is assembled in one place.

## Read more
- Introduction to Node.js: <https://nodejs.org/en/learn/getting-started/introduction-to-nodejs>
- Express: routing <https://expressjs.com/en/guide/routing.html>, middleware <https://expressjs.com/en/guide/using-middleware.html>, error handling <https://expressjs.com/en/guide/error-handling.html>
- HTTP status codes (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status>

---

## Exercises 6.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 6.1: An Express app with health check and errors

**Edit:** `app/server/src/app.ts` · **Tests:** `tests/part-6/6.1-express-app.test.ts` · **Run:** `npm run ex 6.1`

Write `createApp(mount)`: JSON parsing (limit 2 MB), `GET /api/health`, then `mount(app)`, then the JSON 404 for `/api`, then the error handler (400 for invalid JSON, 500 otherwise). Run `npm run dev:server` and open <http://localhost:3001/api/health>.

---

[← Part 6 overview](README.md) · [6b A REST API →](b-rest-api.md)
