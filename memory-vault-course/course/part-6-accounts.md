# Part 6: Accounts and sign-in

All the way through, the app has treated everybody as one pre-made user. That was fine for building features, but a private memory vault must know **who is asking** and refuse everyone else.

Authentication is the part of a web app where small mistakes have big consequences, so this part is slower and more careful than the others. You will learn how passwords must be stored, what a session and a cookie are, and how to defend against guessing and cross-site attacks.

- [a) Storing passwords](#a-storing-passwords)
- [b) Sessions and cookies](#b-sessions-and-cookies)
- [c) Attacks to defend against](#c-attacks-to-defend-against)
- [d) The sign-in routes](#d-the-sign-in-routes)
- [e) The login form](#e-the-login-form)
- [Self-check](#self-check) · [Run the app](#run-the-app)

---

## a) Storing passwords

Never store a password. Store a **hash**: a one-way scramble. Given the hash you cannot get the password back, but you can check a guess by hashing it the same way and comparing. If the database leaks, the passwords do not.

Two refinements matter:

- A good password hash is **slow on purpose** (scrypt, bcrypt, argon2). Checking one password takes a fraction of a second, which nobody notices; trying a billion guesses becomes unaffordable. Fast hashes like plain SHA-256 are the wrong tool here.
- Each password gets a random **salt**, mixed into the hash. Two users with the same password then have completely different hashes, and an attacker cannot use one precomputed table for everyone.

Node has scrypt built in:

```ts
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);        // turns a callback function into one that returns a Promise

const salt = randomBytes(16);
const hash = await scrypt('my password', salt, 64, { N: 16384, r: 8, p: 1 });   // a Buffer
```

The stored value keeps everything needed to verify later, in one string: `scrypt$16384$8$1$<salt>$<hash>`. Because the settings are inside the string, you can make future hashes stronger and old ones still verify.

When comparing, use `timingSafeEqual`, not `===`. A normal comparison stops at the first different character, so the *time it takes* can reveal how many characters matched. `timingSafeEqual` always takes the same time. Read the [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

### Exercise 6.1: Password hashing

> **File:** `server/src/auth/password.ts` · **Test:** `npm run ex -- 6.1`

`verifyPassword` must return `false`, never throw, for anything that is not a valid stored hash. One test uses a hash made with *different* settings, to prove you read them from the string.

---

## b) Sessions and cookies

HTTP forgets you between requests. After a correct password, the server makes a long **random token**, remembers it, and gives it to the browser in a **cookie**. The browser sends the cookie back automatically on every request, and the server looks the token up: that is a **session**.

- The token must be unguessable: 32 random bytes, `randomBytes(32).toString('base64url')`.
- The server stores only `sha256(token)`. If someone reads the server's memory, they cannot turn the stored values into working logins.
- Sessions **expire**, and sign-out deletes them on the server (just clearing the cookie in the browser would leave the token valid).
- Every session also gets a second random value, the **CSRF token** (next section).

Our `SessionStore` takes the clock as an option (`now: () => number`). Tests pass a fake clock and "wait 14 days" instantly. Injecting the clock is the standard way to test anything that depends on time.

### Exercise 6.2: Sessions

> **File:** `server/src/auth/sessions.ts` · **Test:** `npm run ex -- 6.2`

A `Map` keyed by `sha256(token)` is all you need. Remember to delete a session you discover is expired.

---

## c) Attacks to defend against

### Guessing

Without a limit, someone can try millions of passwords. After five wrong tries we lock the address and the username for 15 minutes. We count under *two* keys, `ip:...` and `user:...`, so both "one account from many addresses" and "many accounts from one address" get stopped.

### Exercise 6.3: Login lockout

> **File:** `server/src/auth/loginLimiter.ts` · **Test:** `npm run ex -- 6.3`

Reset the counter when a lock starts; a lock is active while `lockedUntil > now()`.

### CSRF: another website using your cookie

Browsers attach cookies to a request *even when another website caused it*. Imagine you are signed in to Memory Vault and visit `evil.example`, whose page quietly sends `DELETE /api/media/123` to our server. The browser adds your cookie, and without defences the server would obey.

We stack three defences (*defence in depth*):

1. The cookie is `SameSite=Strict`: browsers do not send it on cross-site requests at all.
2. For every change (anything but `GET`/`HEAD`), if the request has an `Origin` header, its host must equal the `Host` header.
3. Every change must carry the session's **CSRF token** in a header (`X-CSRF-Token`). A page on another site cannot read it, so it cannot send it.

Also `HttpOnly` keeps page scripts from reading the session cookie even if they somehow run. Read [MDN: CSRF](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF).

### Middleware that guards everything

`requireAuth` is Express middleware, a function `(req, res, next)`. It checks the cookie, answers `401` if there is no session, performs the CSRF checks, and calls `next()` otherwise. Put it in front of every private route and no route can forget to check.

### Exercise 6.4: Auth middleware

> **File:** `server/src/http/authMiddleware.ts` · **Test:** `npm run ex -- 6.4`

Three pieces: `parseCookies`, `safeEqual`, `requireAuth`. The tests use `supertest` against a tiny Express app.

<details><summary>Hint: the Origin check</summary>

`new URL(origin).host` gives `vault.example.com`; compare it with `req.headers.host`. `new URL('null')` throws, so wrap it in `try/catch` and treat a failure as a bad origin.
</details>

---

## d) The sign-in routes

Your four pieces become three routes (`server/src/http/routes/auth.ts`): `POST /login`, `POST /logout`, `GET /me`. Two details deserve attention.

**The same answer for every failure.** "Unknown user" and "wrong password" must look *identical*, in the message and in the time taken. Otherwise an attacker can discover which usernames exist. That is why the code always verifies against *something* (`getDummyHash`, given) even when the user does not exist.

**Swapping the strategy.** `server/src/auth/strategies.ts` (given) shows how the app has been working: `createApp` takes an `AuthStrategy`, a router plus a middleware. `devAuth` (everyone is "dev") was the strategy for parts 1 to 5; `realAuth` bundles *your* router and middleware. Switching is one line in `main.ts`: start the server with `AUTH=real`. No other file changes, because every route was already written against `req.session!.userId`. That is the payoff of passing the user in, and of always filtering by `user_id`.

### Exercise 6.5: Sign-in routes

> **File:** `server/src/http/routes/auth.ts` · **Test:** `npm run ex -- 6.5`

The comment above `authRouter` is a numbered recipe for each route, with every status code and message.

---

## e) The login form

The sign-in screen is a small form with states: typing, signing in, failed. It is the same shape as your note editor: controlled inputs, a `busy` flag, an error message with `role="alert"`, and a callback prop (`onSubmit`) that does the real work.

### Exercise 6.6: Login form

> **File:** `web/src/components/LoginForm.tsx` · **Test:** `npm run ex -- 6.6`

While waiting, the button is disabled and reads "Signing in…" (the user must not click twice). When the promise rejects, show the error and let them try again.

---

## Self-check

1. Why hash passwords with a *slow* function? What does the salt add?
2. Why does the session store keep `sha256(token)` and not the token?
3. Describe a CSRF attack in your own words. Which three defences does the app use?
4. Why must "unknown user" and "wrong password" give the same answer and take the same time?
5. What does `HttpOnly` protect against? What does `SameSite=Strict` protect against?
6. What did switching from `devAuth` to `realAuth` require changing in the routes you wrote earlier?

## Run the app

Create two accounts, then run the server with real sign-in:

```bash
VAULT_PASSWORD="a long password here" npm run create-user -w server -- alice
VAULT_PASSWORD="another long password" npm run create-user -w server -- bob
AUTH=real npm run dev:server        # stop the old server first; the web app is unchanged
```

(The earlier sample photos belong to the `dev` user, so alice starts with an empty library.) Open <http://localhost:5173>:

- you now see the **login form**; a wrong password shows an error,
- sign in as alice and upload a photo; sign out and sign in as bob: his library is empty, and alice's photo is invisible,
- try five wrong passwords in a row: the sixth attempt is refused even with the right password,
- open the browser's developer tools, Application, Cookies: the session cookie is marked `HttpOnly` and `SameSite=Strict`.

Tick the manual boxes and run `npm run progress`. **Stretch:** add a `GET /api/sessions` count for the signed-in user and a "sign out everywhere" route.
