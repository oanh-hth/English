# Memory Vault

A private, login-only scrapbook for photos and videos in **original quality**, with notes on every memory.

- Files are stored byte-for-byte (no re-compression, no resizing).
- Originals live in a **private Cloudflare R2 bucket**, not on your device or the app server. The browser uploads straight to R2, so big videos never pass through the server.
- Each item has a title, date of the memory, tags and a note. **Series** group many photos in order, with one shared note, a cover, and flip-through viewing.
- Two (or more) users, each with a completely separate library.
- Peach-and-mint scrapbook design. Stack: Node.js 22.9+, Express, SQLite (built into Node), plain HTML/JS with self-hosted fonts.

Full documentation (user guide, architecture, API reference, security): [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)

## Quick start (with R2)
1. **Cloudflare dashboard → R2 → Create bucket** (keep it private; do *not* enable public access or a public domain).
2. **R2 → Manage API tokens → Create API token**: permission *Object Read & Write*, scoped to that one bucket. Note the Access Key ID and Secret.
3. Bucket **Settings → CORS policy**, so your browser may upload directly (replace the origin with your real address; use `http://localhost:3000` for local trials):
   ```json
   [{
     "AllowedOrigins": ["https://vault.example.com"],
     "AllowedMethods": ["PUT"],
     "AllowedHeaders": ["content-type"],
     "MaxAgeSeconds": 3600
   }]
   ```
4. Configure and run:
   ```
   cd memory-vault
   npm install
   cp env.example .env        # fill in R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
   npm run create-user -- alice   # asks for a password (min 12 chars); repeat for the second user
   npm start                      # http://127.0.0.1:3000
   ```
There is no sign-up page on purpose: only someone with shell access can create accounts. Re-running `create-user` for an existing name resets that password and signs them out everywhere.

Just trying it out? Leave `STORAGE` unset (or `STORAGE=local`) to keep files in `./data/files` instead.

| Env var | Default | Meaning |
|---|---|---|
| `STORAGE` | `local` | `r2` or `local` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | | Required for `r2`. `R2_ENDPOINT` overrides the URL (EU buckets) |
| `PORT` / `HOST` | `3000` / `127.0.0.1` | Listens on localhost only; reach it through a TLS proxy or VPN |
| `COOKIE_SECURE` | unset | Set to `1` over HTTPS (adds `Secure`, `__Host-` cookie prefix, HSTS) |
| `TRUST_PROXY` | unset | Set to `1` behind one reverse proxy so rate limiting sees the real client IP |
| `MAX_UPLOAD_MB` | `5000` | Per-file limit (R2 single uploads are capped at 5 GB) |
| `DATA_DIR` | `./data` | SQLite database (and local files when `STORAGE=local`) |

## How it works
- **Upload:** the app records a pending item and gives the browser a one-time signed R2 link (valid 1 hour, tied to the exact file size). The browser sends the file untouched. The app then checks the size, reads the first bytes to learn the *real* type (images and videos only; a script renamed `.png` is deleted), and only then shows the item. Abandoned uploads are cleaned up after a day.
- **Viewing:** after the login check the app redirects to a signed R2 link that stops working within the hour. Nothing in the bucket is public. Video seeking works.
- **Database:** only titles, notes, tags, dates and series order (SQLite, a few MB). Back it up: copy `data/vault.db` somewhere safe.

## How it is protected
- **Login required for everything** except the login page. Media URLs are not public links.
- Passwords hashed with scrypt; session tokens are random, stored only as SHA-256 hashes, `HttpOnly` + `SameSite=Strict` cookies, 14-day expiry, server-side logout.
- Login lockout after 5 failures (15 min), constant-time checks, no username enumeration.
- CSRF: Strict cookies + Origin check + per-session token on every write.
- Per-user isolation: every query is scoped to the signed-in user; ids are random.
- Files get random object names; the bucket is private; the app never exposes bucket keys or credentials to the browser.
- Strict CSP (no inline script or style; only your own origin and the R2 origin), `nosniff`, no framing, `no-referrer`, `noindex`.
- Notes are rendered as text only (no HTML injection).

## Deploy
1. Keep the app on `127.0.0.1` and put **Caddy** (automatic HTTPS) in front, or reach it only through **Tailscale/WireGuard** so it is never on the open internet.
   ```
   vault.example.com { reverse_proxy 127.0.0.1:3000 }
   ```
   Then set `COOKIE_SECURE=1 TRUST_PROXY=1`. Uploads no longer pass through the proxy when using R2.
2. The server only needs a small disk (the database). A $4-6/month VPS is plenty, since the photos are in R2.
3. Run as a non-root user and `chmod 700 data`.

## Backups
R2 stores your files durably, but it is not a backup: deleting a photo (or a leaked key) deletes it for good. Occasionally copy the bucket somewhere else, for example `rclone sync r2:your-bucket b2:your-backup-bucket`, and copy `data/vault.db` too.

## Tests
```
STORAGE=local DATA_DIR=/tmp/vault-test PORT=3999 VAULT_PASSWORD='correct horse battery' npm run create-user -- alice
STORAGE=local DATA_DIR=/tmp/vault-test PORT=3999 VAULT_PASSWORD='another long passphrase' npm run create-user -- bob
STORAGE=local DATA_DIR=/tmp/vault-test PORT=3999 npm start &
npm test
```
It covers login, uploads, type checks, byte-identical downloads, range requests, user isolation, and series (create, reorder, cover, remove, delete). The same suite also passes against an S3-compatible emulator using the R2 code path.

## Honest limits
- No web app can stop a signed-in person from saving what their own screen shows. This design stops *outsiders*: no public URLs, no guessable ids, no hotlinking, no scraping without a login.
- Files are encrypted at rest by Cloudflare, not end-to-end: Cloudflare could technically read them. Use a long unique password and a scoped API token.
- The grid loads full originals (no thumbnails yet), so a big library is slow on a weak connection.
- Single uploads are limited to 5 GB; resumable/multipart uploads for larger videos are not built.
- HEIC photos can't be previewed in most browsers; they download fine.

## Ideas for later
Thumbnails (via Cloudflare Images or `sharp`/`ffmpeg`), HEIC preview, multipart uploads, two-factor login, per-item sharing.
