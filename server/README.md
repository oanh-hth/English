# Lexigrow sync server (optional)

Lexigrow works fully without this. Run it only if you want your notes, schedule and garden to stay in step between devices, for example an iPhone and an iPad.

It is a small Node.js and PostgreSQL service with accounts and one synced copy of your data per user. The app does the merging (note by note, see `../merge.js`). The server only stores the result and refuses a save that was built on an outdated copy, so two devices can never silently overwrite each other.

## Try it on your computer

```bash
cd server
cp .env.example .env          # then put a long random JWT_SECRET in it: openssl rand -base64 48
docker compose up --build     # PostgreSQL and the server on http://localhost:8787
```

In another terminal serve the app (`python3 -m http.server 8123` in the repository root), open `http://localhost:8123`, go to **Me > Sync between devices**, enter `http://localhost:8787`, pick a username and a password of at least 10 characters, and tap **Create account**. Open the app in a second browser, **Log in** with the same account, and the notes appear.

Without Docker: start any PostgreSQL, set `DATABASE_URL` in `.env`, then `npm install && npm run dev`.

## Put it online

Any host that runs a Docker container next to a PostgreSQL database works (Render, Fly.io, Railway, a small VPS). Free plans and their limits change, and some free databases are deleted after a while, so check the current terms before trusting one with your notes.

1. Create a PostgreSQL database and copy its connection string.
2. Create a web service from this `server/` folder (it has a `Dockerfile`).
3. Set these environment variables **in the host's dashboard**, never in a file in git:

| Variable | Value |
|---|---|
| `DATABASE_URL` | the connection string from step 1 |
| `JWT_SECRET` | at least 32 random characters (`openssl rand -base64 48`) |
| `CORS_ORIGIN` | the address your app is served from, for example `https://your-name.github.io` (comma separated if several) |
| `NODE_ENV` | `production` (the Dockerfile sets it) |

4. Open `https://your-server/api/health`. It should answer `{"ok":true}`.
5. In the app, **Me > Sync between devices**, enter the server's `https://` address and create your account. Log in on your other device.

The app must reach the server over **HTTPS** when the app itself is on HTTPS (GitHub Pages is). The tables are created on first start.

## What it stores and how it is protected

- `users`: username and a **bcrypt hash** of the password. The password itself is never stored.
- `states`: one JSON document per user (your notes, schedule, garden and settings) and a revision number.
- Login returns a token (JWT, 90 days) that the app keeps in the browser, apart from your notes, so it is never inside a backup file.
- Sign-up and login are rate limited. Request bodies are limited to 2 MB. Errors never include internals.
- Whoever runs the server can read the data in its database. Run it yourself or use one run by someone you trust.
- If you change `JWT_SECRET`, everyone is logged out and logs in again. Nothing is lost.
- Deleting an account (`DELETE /api/me` with the password) removes the user and their data.

## API

| Method and path | Purpose |
|---|---|
| `GET /api/health` | liveness |
| `POST /api/users` `{ username, password }` | create an account, returns `{ username, token }` |
| `POST /api/login` `{ username, password }` | returns `{ username, token }` |
| `GET /api/state` | `{ rev, data }`, or `{ rev: 0, data: null }` before the first save |
| `PUT /api/state` `{ baseRev, data }` | save if `baseRev` is still the current revision, else `409` |
| `DELETE /api/me` `{ password }` | delete the account |

## Tests

```bash
npm install
npm test                  # 14 API tests against a real PostgreSQL engine running in memory (PGlite)
node test/sync.e2e.js     # two browsers syncing through the server (needs Playwright)
```
