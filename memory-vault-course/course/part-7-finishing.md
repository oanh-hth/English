# Part 7: Hardening and the finished app

The app works and has real sign-in. In this last part you add the final layers of protection, write a **cloud storage driver**, and prove that the pieces you built across seven parts fit together.

- [a) Security headers](#a-security-headers)
- [b) Cloud storage](#b-cloud-storage)
- [c) The capstone](#c-the-capstone)
- [d) What you built](#d-what-you-built)
- [Self-check](#self-check) · [Run the finished app](#run-the-finished-app)

---

## a) Security headers

So far every defence is code that *you* wrote correctly. **Headers** add defences enforced by the *browser*, so they still protect you if you make a mistake somewhere else. They cost almost nothing.

The most important is **Content-Security-Policy (CSP)**, a list of rules about where the page may load things from:

```
script-src 'self'         only scripts from our own server run
img-src 'self' data: blob:  images from us, data: and blob: URLs
frame-ancestors 'none'    nobody may put our site in an <iframe> (clickjacking)
```

With `script-src 'self'`, an injected `<script>` or an inline `onerror=` handler is simply **not executed**, even if user text somehow reached the page unescaped. That is a second wall behind React's escaping. Read [MDN: CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP).

A few more, each a single line:

| Header | Effect |
|---|---|
| `X-Content-Type-Options: nosniff` | the browser must not guess a file's type |
| `Referrer-Policy: no-referrer` | do not tell other sites which page a link came from |
| `Cross-Origin-Resource-Policy: same-origin` | other sites cannot embed our files |
| `Strict-Transport-Security` | "always use HTTPS from now on" (only send it when you really use HTTPS) |

### Exercise 7.1: Security headers

> **File:** `server/src/http/securityHeaders.ts` · **Test:** `npm run ex -- 7.1`

Until now this middleware did nothing (so earlier parts were unaffected). Implement `buildCsp` and `securityHeaders`; `app.ts` already installs it.

---

## b) Cloud storage

Local disk is fine for one machine, but the app will eventually run on a small server whose disk is tiny. **Object storage** (Cloudflare R2, Amazon S3, Backblaze B2) keeps files by key in a bucket, cheaply and durably. The same idea appears everywhere: *put an object, get an object, delete it*.

The clever part is the **signed URL**. Your server does not carry the upload. It asks the storage service for a temporary address with a permission built in ("one `PUT` of exactly this size to this key, valid for an hour"), and the *browser* sends the file straight there. To view a photo the server first checks your login, then redirects you to a short-lived signed link. The bucket stays **private**: only your server can sign, and signatures expire.

Which is why `complete` (part 4) still validates every upload even though the bytes never touched our server: the browser is still not trusted.

You wrote everything against the `Storage` interface in part 2, so a new backend is *one new file*. And to test it without any cloud account you use **dependency injection** again: `createR2Storage(client)` takes a small `ObjectClient` interface (put, get, head, delete, sign). In production, a thin adapter over the AWS SDK implements it (see `memory-vault/src/storage.js` in this repository, which uses exactly the real calls); in tests, a fake.

One detail worth understanding: a signature depends on the time it is made. If every request signed "now", each page view would get a *different* URL and the browser could never cache a photo. So the driver rounds the signing time down to a 30-minute boundary: the same photo keeps the same link for a while, and every link still expires within the hour.

### Exercise 7.2: Cloud storage driver

> **File:** `server/src/storage/r2Storage.ts` · **Test:** `npm run ex -- 7.2`

Mostly mapping each `Storage` method to an `ObjectClient` call, plus the rounded signing time.

---

## c) The capstone

When every exercise is green, there is still a question unit tests cannot answer: **does it all work together?** A wrong cookie flag, a missing header, a step done in the wrong order: these hide *between* the pieces.

Exercise 7.3 has no stub. Two test files run the whole system:

- `server/tests/7.3-capstone.test.ts` starts the real app with **real sign-in**, real passwords, SQLite and files on disk, and walks a whole journey: wrong passwords and lockout, sign in, upload three photos, make a series, edit and reorder it, download a photo byte for byte (and a slice), delete, sign out, and check two users never see each other's data.
- `web/tests/7.3-capstone.test.tsx` renders the whole `<App>` against a fake server: login screen, library by year, editing a note, flipping a series, signing out.

If one fails, read the message, find the exercise it points to, and fix *that*. Debugging across layers like this is most of real-world engineering.

### Exercise 7.3: Capstone

> **Tests:** `npm run ex -- 7.3` · **Code to write:** none

---

## d) What you built

A private, login-only scrapbook that:

- stores **originals** untouched, checks every upload by its bytes, and streams them back with byte ranges so videos can seek,
- keeps each user's library separate,
- hashes passwords, expires sessions, locks out guessers, and resists CSRF and XSS,
- groups photos into **series** with one shared note, a cover and an order,
- and talks to **any storage** through one interface (local today, cloud when you deploy).

And you built it with TypeScript on both sides, Express, SQLite, React, Testing Library and supertest, in code that is covered by 28 groups of tests.

### Where to go next

- **Deploy it:** put the server behind a TLS proxy, set `COOKIE_SECURE=1`, and write the small AWS-SDK adapter for `ObjectClient`.
- **Thumbnails** so a big library loads fast (the grid currently loads full originals).
- **Resumable multipart uploads** for videos over 5 GB.
- **Two-factor sign-in**, per-photo captions in the series reader, sharing a series with one other person.
- Compare your work with the reference JavaScript app in the `memory-vault/` folder and its `docs/DOCUMENTATION.md`.

---

## Self-check

1. What attack does `script-src 'self'` stop? How is that different from React escaping text?
2. Why must the storage bucket stay private? How do browsers upload and view anyway?
3. Why does `complete` still validate a file that went straight to the bucket?
4. Why is the signing time rounded down to 30 minutes?
5. Name three separate layers that stop a stranger from seeing a stored photo.
6. Which exercise would you look at first if the capstone said "Bad CSRF token" on an upload?

## Run the finished app

```bash
AUTH=real npm run dev:server      # API on :3000 (files and database in ./data)
npm run dev:web                   # app on :5173
```

Open <http://localhost:5173>, sign in, and use every feature once: upload photos, make a series, flip through it, write notes, download an original, sign out. Look at the response headers of any `/api` call in the browser's network tab and find your CSP.

Tick the last manual boxes in `CHECKLIST.md`, write down three things you would build next, and run `npm run progress`. Every box ticked means you built, tested and understood a complete full-stack application.
