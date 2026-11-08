# Phase 7: Hardening and capstone

**Goal:** add security headers, write a cloud storage driver behind the same interface, then prove the whole app works together.
**You build:** security headers, an R2/S3-style storage driver, and you run the finished app.
**Time:** about 3 to 5 hours.

## Learn first

### 1. Defence in depth
No single check is enough. You already have: login, scrypt, sessions, CSRF, ownership checks, file-type sniffing, validation. Headers add a browser-enforced layer that limits the damage of a mistake.

### 2. Content-Security-Policy (CSP)
A CSP tells the browser where scripts, images and connections may come from. `script-src 'self'` means *only scripts from our own server run*, so an injected `<script>` or inline handler is blocked. `frame-ancestors 'none'` stops clickjacking. Read: [MDN: CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP).

### 3. Other protective headers
`X-Content-Type-Options: nosniff` (the browser must not guess file types), `Referrer-Policy: no-referrer`, `Cross-Origin-Resource-Policy`, `Strict-Transport-Security` (HTTPS only, set only when you really use HTTPS).

### 4. Cloud object storage
R2, S3 and B2 store "objects" by key. Your server never carries a big upload: it hands the browser a **signed URL**, a temporary address with a built-in permission that expires. The bucket stays private; only the server can sign. This is why `Storage.direct` exists, and why `complete` re-checks the size and type afterwards (the browser is still not trusted).

### 5. Dependency injection (again)
`createR2Storage(client)` takes an `ObjectClient` instead of importing the AWS SDK. In tests you pass a fake; in production a thin adapter around the real SDK (see `memory-vault/src/storage.js` in this repository for a working one). That is also how you test a cloud driver without a cloud account.

### 6. Rounded signing time
A signature depends on the time it was made. If every request signed "now", every page view would have a new URL and the browser could never cache a photo. Rounding the time down to 30 minutes gives stable URLs that still expire within the hour.

### 7. The capstone mindset
When everything is "done", integration tests find what unit tests miss: a wrong cookie flag, a header that does not match behind a proxy. The two capstone tests have no stub to fill in: they run the whole system, and failures tell you which earlier piece to revisit.

## Self-check
1. What attack does `script-src 'self'` stop, and what would stop working if you added `'unsafe-inline'`?
2. Why must the storage bucket stay private?
3. Why does `complete` still validate a file that went straight to the bucket?
4. Why round the signing time?
5. Name three layers that protect an uploaded photo from being seen by the wrong person.

## Exercises

### 7.1 Security headers  (`server/src/http/securityHeaders.ts`)
**Builds:** CSP and friends on every response. Until you do it, the middleware is a no-op, so the rest of the course works.

### 7.2 Cloud storage driver  (`server/src/storage/r2Storage.ts`)
**Builds:** the same `Storage` interface as local disk, backed by an object store. Mostly mapping calls one-to-one, plus the rounded signing time.

### 7.3 Capstone  (no code to write)
**Checks:** `server/tests/7.3-capstone.test.ts` (real login, uploads, series, downloads, user separation, lockout, headers) and `web/tests/7.3-capstone.test.tsx` (the whole `<App>`).
If one fails, read the message, find the exercise it points at, and fix that.

## Run the real app
In two terminals:
```bash
# terminal 1: the API on :3000
VAULT_PASSWORD="a long password here" npm run create-user -w server -- alice   # once
npm run dev:server

# terminal 2: the web app on :5173
npm run dev:web
```
Open http://localhost:5173, sign in, upload three photos as a series, flip through them, write a note. Then tick the manual boxes in `CHECKLIST.md`.
(The vite proxy keeps the original `Host` header on purpose: our CSRF origin check compares it with the browser's `Origin`.)

## Where to go next
Thumbnails for big libraries, resumable multi-part uploads, two-factor login, real R2 deployment with a signed-URL adapter, per-photo captions in the series reader. See the finished reference app in the `memory-vault/` folder and its `docs/DOCUMENTATION.md`.
