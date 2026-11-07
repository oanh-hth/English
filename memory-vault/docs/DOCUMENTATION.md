# Memory Vault: Documentation

Contents
1. [What it is](#1-what-it-is)
2. [User guide](#2-user-guide)
3. [Architecture](#3-architecture)
4. [Data model](#4-data-model)
5. [API reference](#5-api-reference)
6. [Upload flow in detail](#6-upload-flow-in-detail)
7. [Storage drivers (local and R2)](#7-storage-drivers-local-and-r2)
8. [Security model](#8-security-model)
9. [Frontend guide](#9-frontend-guide)
10. [Configuration](#10-configuration)
11. [Running, testing and maintenance](#11-running-testing-and-maintenance)
12. [Troubleshooting](#12-troubleshooting)
13. [Limits and roadmap](#13-limits-and-roadmap)

---

## 1. What it is
Memory Vault is a private web app for keeping photos and videos in **original quality** and writing notes about them, like a place of memory. Everyone must sign in. Each user has a separate library. Files are never re-compressed or resized.

Main features
- Upload many photos and videos at once, with progress bars.
- A title, date of the memory, tags and a note for every item.
- **Series:** an ordered group of photos with a shared note, a cover and flip-through viewing.
- Search over titles, notes, tags and file names; filter by photos or videos.
- Download the untouched original at any time.

## 2. User guide

### Signing in
Open the app and enter your username and password. There is no sign-up page: the owner creates accounts (see [section 11](#11-running-testing-and-maintenance)). After five wrong attempts the account and your network address are locked for 15 minutes. **Sign out** ends the session on the server.

### The library
Memories are grouped by year, newest first. A tile is either a single photo or video, or a **stack** (a series) with a count such as "6 items". A heart sticker means a single photo has a note. Use the search box and the All / Photos / Videos filter at the top.

### Uploading
1. Click **Upload** or drop files anywhere on the page.
2. Choose one file or many. With two or more files you pick:
   - **One series, in the order below:** give the series a title and date, and reorder the files with the arrows.
   - **Separate items:** each file becomes its own memory.
3. Click **Create series** or **Add to library**. Progress bars show each file; the library refreshes when done.

Accepted types: JPEG, PNG, GIF, WebP, HEIC, AVIF (photos) and MP4, MOV, WebM, AVI (videos). The app checks the real content of the file, not its name, so other files are refused.

### Opening and writing notes
Click a tile.
- **Single item:** the file is on the left; title, date, tags and notes are on the right. **Save notes** stores them. The **Add to a series** menu moves the item into an existing series.
- **Series:** use the arrows, the left/right keys, or the thumbnail strip to flip through. The right side has the series title, date, tags and a note for the whole series. The **Photo n of N** box holds a caption and a note for the photo on screen, with:
  - **Move earlier / Move later:** change its position (saved immediately).
  - **Set as cover:** the photo shown on the library tile (marked with a star).
  - **Remove from series:** it becomes a separate item again.
  - **Add photos:** upload more files to the end of the series.
- **Download original** saves the exact file you uploaded.
- **Delete** (and **Delete series**) ask you to click twice. Deleting a series also deletes its photos; move a photo out first to keep it.

## 3. Architecture

```
Browser (public/app.js)  ──HTTPS──▶  Node/Express server (src/server.js)
                                         ├── auth.js     passwords, sessions
                                         ├── db.js       SQLite (vault.db)
                                         ├── sniff.js    real file-type check
                                         └── storage.js  ┬─ local disk  (./data/files)
                                                          └─ Cloudflare R2 (private bucket)
```

| File | Responsibility |
|---|---|
| `src/server.js` | Routes, security headers, CSRF and auth checks, uploads, series logic |
| `src/auth.js` | scrypt password hashing, session create/find/destroy, cookie parsing |
| `src/db.js` | Opens SQLite, creates and upgrades the tables |
| `src/storage.js` | One interface, two drivers: `uploadTarget`, `head`, `readHead`, `remove`, `getUrl` |
| `src/sniff.js` | Detects image/video type from the first bytes |
| `scripts/create-user.js` | Creates a user or resets a password |
| `public/index.html` | The single page: login, library, upload panel, reader dialog |
| `public/app.js` | All frontend behavior (ES module, no build step) |
| `public/style.css`, `fonts.css`, `fonts/` | The design and self-hosted fonts |
| `test/api.mjs` | Automated API checks |

Runtime: Node.js 22.9+ with the built-in `node:sqlite`. Dependencies: `express`, plus the AWS SDK S3 client (used only for R2). There is no frontend build step.

## 4. Data model
SQLite file `data/vault.db`.

**users**: `id`, `username` (unique, case-insensitive), `password_hash`, `created_at`.

**sessions**: `token_hash` (SHA-256 of the cookie value), `user_id`, `csrf`, `created_at`, `expires_at`.

**media** (one row per photo or video)

| Column | Meaning |
|---|---|
| `id` | random 24-hex id used in URLs |
| `user_id` | owner |
| `kind`, `mime` | `image`/`video` and the detected type |
| `original_name`, `size` | as uploaded |
| `storage_name` | random object key; unrelated to the file name |
| `title`, `note`, `tags` | text fields |
| `taken_on` | `YYYY-MM-DD`, the date of the memory (defaults to the file's modified date) |
| `status` | `pending` until the upload is verified, then `ready` |
| `series_id`, `position` | membership and order inside a series |
| `created_at`, `updated_at` | milliseconds since epoch |

**series**: `id`, `user_id`, `title`, `note`, `tags`, `taken_on`, `cover_id`, timestamps.

Rules kept by the server
- A series with no photos is deleted automatically.
- If a series' cover photo leaves it, the first remaining photo becomes the cover.
- Only `ready` items are ever returned or served.

## 5. API reference
All routes are under `/api`. Responses are JSON unless noted. "Auth" means a valid session cookie is required; every **non-GET** auth route also needs the header `X-CSRF-Token` (from `/api/me`).

### Session
| Method | Path | Body | Result |
|---|---|---|---|
| POST | `/login` | `{username, password}` | `200 {ok}` and sets the cookie; `401` wrong details; `429` locked |
| POST | `/logout` (auth) | | `{ok}` |
| GET | `/me` | | `{username, csrf, maxUploadBytes, storage}` or `401` |

### Library
| Method | Path | Body | Result |
|---|---|---|---|
| GET | `/library` (auth) | | `{media:[...], series:[...]}` (see below) |

`media[]`: `id, kind, mime, original_name, size, title, note, tags, taken_on, series_id, position, created_at`.
`series[]`: `id, title, note, tags, taken_on, cover_id, created_at`. Storage keys are never included.

### Items
| Method | Path | Body | Notes |
|---|---|---|---|
| PATCH | `/media/:id` (auth) | any of `title, note, tags, taken_on` | `taken_on` must be `YYYY-MM-DD` |
| DELETE | `/media/:id` (auth) | | deletes the record and the stored file |
| GET | `/media/:id/file[?download=1]` (auth) | | the original bytes; `Range` supported (local), or a `302` to a signed link (R2) |

### Series
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/series` (auth) | `{title, note?, tags?, taken_on?, ids:[mediaId,...]}` | `201 {id}`; ids are in display order, the first is the cover |
| PATCH | `/series/:id` (auth) | any of `title, note, tags, taken_on, cover_id, ids` | `ids` sets membership and order; items left out become loose; `ids: []` dissolves the series |
| DELETE | `/series/:id` (auth) | | deletes the series **and its photos** |

### Uploads
| Method | Path | Body | Result |
|---|---|---|---|
| POST | `/uploads` (auth) | `{name, size, taken_on?}` | `201 {id, url, headers}`; `413` too large |
| PUT | `url` from the step above | the raw file | R2: sent to R2. Local: `PUT /api/uploads/:id/data` (auth + CSRF) |
| POST | `/uploads/:id/complete` (auth) | | `{id, kind}`; `400` incomplete; `415` not an image/video |

### Errors and limits
Errors look like `{"error":"message"}`. Status codes used: 400 invalid, 401 not signed in, 403 bad CSRF/origin, 404 not found (also used for other people's items), 413 too large, 415 wrong type, 429 too many logins.

Field limits: title 200 characters, tags 300, note 50,000; up to 2,000 photos per series request; the library returns up to 20,000 items. Maximum upload per file: `MAX_UPLOAD_MB` (default 5000, and 5 GB at most with R2).

## 6. Upload flow in detail
```
Browser                         Server                         Storage
   │ POST /uploads {name,size}     │                               │
   │──────────────────────────────▶│ insert row status=pending     │
   │◀──── {id, url, headers} ──────│ (R2: signed PUT URL)          │
   │ PUT file (untouched) ─────────────────────────────────────────▶│
   │ POST /uploads/:id/complete    │                               │
   │──────────────────────────────▶│ head(): size equals declared? │
   │                               │ readHead(64): sniff() ok?     │
   │                               │ yes → status=ready, kind, mime│
   │                               │ no  → delete file and row     │
   │◀──── {id, kind} ──────────────│                               │
```
- The file is never read into memory by the app and never transformed.
- Until `complete` succeeds, the item is invisible and cannot be fetched.
- Pending items older than 24 hours are removed (file and row) at startup and hourly.
- If the PUT fails in the browser, the page deletes the pending item.
- For a series, the page uploads files one after another, then calls `POST /series` with the ids in order.

## 7. Storage drivers (local and R2)
Selected with `STORAGE`. Both implement the same functions, so no other code changes.

| | `local` (default) | `r2` |
|---|---|---|
| Where files live | `data/files/<random key>` | private R2 bucket |
| Upload target | `PUT /api/uploads/:id/data` on this server | signed R2 PUT URL (1 hour, exact size signed) |
| Viewing | streamed by the server with Range support | `302` to a signed GET URL that stays valid about an hour |
| Browser needs | nothing special | bucket CORS allowing `PUT` from the app's origin |
| CSP | same origin only | R2 origin added to `img-src`, `media-src`, `connect-src` |

Signed viewing URLs are generated against a time rounded to 30 minutes, so the same photo keeps the same URL for a while and the browser can cache it.

## 8. Security model
| Threat | Defence |
|---|---|
| Someone opens a photo link | Every file request needs a valid session; there are no public links |
| Guessing ids | Ids and storage keys are random (96 and 192 bits) |
| Guessing passwords | scrypt hashing; 5 failed tries lock the user and the IP for 15 minutes; same error text for unknown users |
| Stolen database | Passwords are hashed; session tokens are stored only as SHA-256 hashes |
| Cross-site requests | `SameSite=Strict` cookies, `Origin` check, per-session CSRF token on every write |
| One user reading another's data | Every query includes `user_id`; other people's ids return 404 |
| Malicious upload (HTML/script as `.png`) | Real type from the file's first bytes; only images and videos are accepted |
| Script injection through notes | Notes are inserted as text only; strict CSP (`script-src 'self'`, no inline script or style) |
| Framing, sniffing, leaking referrers | `X-Frame-Options`, `nosniff`, `Referrer-Policy: no-referrer`, `noindex` |
| Oversized uploads | Size declared up front, verified on completion; the limit is enforced |

What it does not do: stop a signed-in person from saving what their own screen shows, or provide end-to-end encryption. With R2 the files are encrypted at rest by Cloudflare. Use long unique passwords, HTTPS (`COOKIE_SECURE=1`), and full-disk encryption on the server.

## 9. Frontend guide
`public/app.js` is one ES module organised in sections:

| Section | What it does |
|---|---|
| data | `lib = {media, series}` loaded from `/api/library`; helpers `byId`, `seriesById`, `idsOf(seriesId)` |
| gallery | `render()` filters (search, kind), groups by year, builds tiles; a series is one entry using its cover |
| reader (shared) | the dialog; `putMedia()` shows an image or video; Esc and click-outside close it |
| single item | edit fields, tags chips, add to series, delete |
| series reader | `openSeries`, `showPhoto`, `keep()` (saves caption/note if changed), `changeSeries()` (saves order/cover/removal then reloads) |
| upload | `stage()` builds the upload panel; `uploadOne()` runs init → PUT with progress → complete; `uploadMany()` runs them in order |
| login | `boot()` checks `/api/me`; the page shows either the login or the app |

Notes for changing it
- Insert user text with `textContent` or `.value`, never `innerHTML` (the only `innerHTML` is the static mascot image).
- No inline `style=` attributes or inline scripts: the CSP forbids them. Set styles in `style.css`.
- Colors and fonts are CSS variables at the top of `style.css`, with a dark-mode set. The design uses system `prefers-color-scheme`.

## 10. Configuration
Settings come from environment variables, or a `.env` file (copy `env.example`). `npm start` loads `.env` automatically.

| Variable | Default | Meaning |
|---|---|---|
| `STORAGE` | `local` | `local` or `r2` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | | Required when `STORAGE=r2` |
| `R2_ENDPOINT` | derived from the account id | Override the S3 endpoint (e.g. EU buckets) |
| `PORT`, `HOST` | `3000`, `127.0.0.1` | Where the server listens |
| `COOKIE_SECURE` | off | `1` when served over HTTPS (secure cookie, `__Host-` prefix, HSTS) |
| `TRUST_PROXY` | off | `1` behind one reverse proxy, so login limits use the real client IP |
| `MAX_UPLOAD_MB` | `5000` | Per-file upload limit |
| `DATA_DIR` | `./data` | Folder for `vault.db` (and files with local storage) |

## 11. Running, testing and maintenance

### Run
```
cd memory-vault
npm install
npm run create-user -- alice      # prompts for a password (12+ characters)
npm start                         # http://127.0.0.1:3000
```

### Users
- Add a user: `npm run create-user -- <name>` (3-32 characters: letters, digits, `_ . -`).
- Reset a password: run the same command for an existing name. It signs that user out everywhere.
- There is no user-delete command yet; delete the row in `vault.db` if needed (their items go with it).

### Tests
The API suite needs a running server with two users, `alice` and `bob`:
```
export DATA_DIR=/tmp/vault-test PORT=3999 STORAGE=local
VAULT_PASSWORD='correct horse battery' npm run create-user -- alice
VAULT_PASSWORD='another long passphrase' npm run create-user -- bob
npm start &
npm test
```
It checks login protection, CSRF, uploads and type rejection, byte-identical downloads, range requests, user separation, and every series operation (25 checks). It passes with local storage and, against an S3-compatible emulator, with the R2 code path.

### Backups
- Copy `data/vault.db` (it holds all titles, notes and series).
- With local storage also copy `data/files/`. With R2, sync the bucket to a second provider; R2 itself is not a backup.

## 12. Troubleshooting
| Symptom | Cause and fix |
|---|---|
| Login says "Too many attempts" | Locked for 15 minutes; restart the server to clear the in-memory lock |
| "Could not reach storage (check the bucket CORS settings)" | R2 only: add a CORS rule allowing `PUT` and `content-type` from the app's address |
| "Unsupported file type" | The file's content is not a supported image or video, whatever its extension |
| "File too large" | Over `MAX_UPLOAD_MB` (5 GB at most with R2) |
| Photos don't appear after upload | The upload did not complete; see the red message under the upload panel |
| HEIC photo shows a "HEIC" tile and no preview | Most browsers cannot display HEIC; use Download original |
| Signed out suddenly | Session expired (14 days) or the server's session was removed; sign in again |
| `.env not found` message at start | Harmless; it appears when there is no `.env` file |

## 13. Limits and roadmap
Current limits: one upload per file up to 5 GB; the grid loads full originals (no thumbnails); no end-to-end encryption; no per-item sharing; no two-factor login.

Ideas for later: thumbnails, resumable multipart uploads, HEIC preview, two-factor login, albums beyond series, a user-management command.
