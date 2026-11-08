# Phase 2: Node.js, accounts and sessions

**Goal:** learn Node's built-in `crypto` module, classes, injected clocks and Express middleware by building secure sign-in.
**You build:** password hashing, sessions, login lockout and the gatekeeper that protects every route.
**Time:** about 3 to 5 hours.

## Learn first

### 1. Never store passwords
Store a **hash**: a one-way scramble. If the database leaks, the passwords do not. Good hashes are *slow on purpose* (scrypt, bcrypt, argon2) so guessing is expensive, and use a random **salt** so identical passwords look different.
Read: [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

### 2. Node's `crypto`
```ts
import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
randomBytes(32).toString('base64url');          // a random token
createHash('sha256').update(text).digest('hex'); // a fixed-size fingerprint
```
`scrypt` uses a callback, so we wrap it with `promisify` to get a Promise. Docs: https://nodejs.org/api/crypto.html

### 3. async / await and Promises
A Promise is a value that arrives later. `await` pauses *your function* (not the whole server) until it does. A function that uses `await` must be `async` and returns a Promise.

### 4. Sessions
After a correct password the server hands the browser a random token in a cookie. Later requests carry the cookie; the server looks the token up. We keep only `sha256(token)`, so a leaked memory dump cannot be replayed as a login.

### 5. Time makes code hard to test, so inject the clock
Instead of calling `Date.now()` everywhere, accept `now: () => number` as an option. Tests pass a fake clock and "wait 15 minutes" instantly. You will see this pattern again and again.

### 6. Classes
A class bundles data and the functions that use it: `private sessions = new Map()` plus `create()`, `find()`... The tests call them exactly like that. Read: [TypeScript: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html).

### 7. Express middleware and CSRF
Middleware is a function `(req, res, next)` that runs before your route. It either answers (`res.status(401).json(...)`) or calls `next()`. Put `requireAuth` in front of everything private and no route can forget the check.
**CSRF:** browsers attach cookies automatically, even when *another website* makes your browser send a request. Defences used here: a `SameSite=Strict` cookie, an `Origin` check, and a secret token the page must send in a header on every change. Read: [MDN: CSRF](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF), [Express: using middleware](https://expressjs.com/en/guide/using-middleware.html).

## Self-check
1. Why does `verifyPassword` use `timingSafeEqual` instead of `===`?
2. Why do two hashes of the same password differ? How can `verifyPassword` still succeed?
3. What do we store for a session, and why not the raw token?
4. Why inject `now` instead of calling `Date.now()` inside `LoginLimiter`?
5. A malicious site makes your browser POST to our server. Which two checks in `requireAuth` stop it?

## Exercises

### 2.1 Password hashing  (`server/src/auth/password.ts`)
**Builds:** safe password storage. Format: `scrypt$N$r$p$salt$hash`. Tests include a hash made with *different* settings to prove the settings come from the stored string.
<details><summary>Hint</summary>

`const hash = await scrypt(password, salt, 64, { N, r, p })` returns a `Buffer`. Join the six parts with `$`. To verify, split on `$`, rebuild with the *stored* salt and settings, and compare with `timingSafeEqual` (the two buffers must have equal length).
</details>

### 2.2 Sessions  (`server/src/auth/sessions.ts`)
**Builds:** "stay signed in" with expiring, revocable sessions.
A `Map<string, Session>` keyed by `sha256(token)` is all you need.

### 2.3 Login lockout  (`server/src/auth/loginLimiter.ts`)
**Builds:** five wrong tries locks that address and username for 15 minutes.
Remember: reset the counter when a lock starts, and compare `lockedUntil > now()`.

### 2.4 Auth middleware  (`server/src/http/authMiddleware.ts`)
**Builds:** the gatekeeper. Three pieces: `parseCookies`, `safeEqual`, `requireAuth`. The tests use `supertest` to send real HTTP requests to a tiny Express app.
<details><summary>Hint: Origin check</summary>

`new URL(origin).host` gives `vault.example.com`; compare it with `req.headers.host`. `new URL('null')` throws, so wrap it in `try/catch` and treat a failure as a bad origin.
</details>

**Done when:** all four exercises are green. Then read `server/src/http/routes/auth.ts` (given): it is your four pieces working together as login, logout and "who am I".

## Finished the phase?
`npm run progress`, tick the manual boxes. **Stretch:** add a `maxSessionsPerUser` option to `SessionStore` that removes the oldest session when the limit is exceeded.
