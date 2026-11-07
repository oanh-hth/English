# Memory Vault

A private, login-only place to keep photos and videos **in original quality** with notes about each one.

- Files are stored byte-for-byte (no re-compression, no resizing). Browser uploads stream straight to disk.
- Each item has a title, date of the memory, tags and free-text notes. Search covers all of them.
- Two (or more) users, each with a completely separate library.
- Stack: Node.js 22+, Express, SQLite (built into Node), plain HTML/JS. One dependency (`express`).

## Run it
```
cd memory-vault
npm install
npm run create-user -- alice        # asks for a password (min 12 chars); repeat for a second user
npm start                           # http://127.0.0.1:3000
```
There is no sign-up page on purpose: only someone with shell access can create accounts.
Re-running `create-user` for an existing name resets that password and signs them out everywhere.

Data lives in `./data` (`vault.db` + `files/`). Change with `DATA_DIR=/path`.

| Env var | Default | Meaning |
|---|---|---|
| `PORT` / `HOST` | `3000` / `127.0.0.1` | Listens on localhost only; reach it through a TLS proxy or VPN |
| `COOKIE_SECURE` | unset | Set to `1` when served over HTTPS (adds `Secure`, `__Host-` cookie prefix, HSTS) |
| `TRUST_PROXY` | unset | Set to `1` behind one reverse proxy so rate limiting sees the real client IP |
| `MAX_UPLOAD_MB` | `8192` | Per-file upload limit |

## How it is protected
- **Login required for everything** except the login page. Media URLs are not public links; opening one without a valid session returns 401.
- Passwords hashed with scrypt; session tokens are random, stored only as SHA-256 hashes, `HttpOnly` + `SameSite=Strict` cookies, 14-day expiry, server-side logout.
- Login lockout after 5 failures (15 min), constant-time checks, no username enumeration.
- CSRF: Strict cookies + Origin check + per-session token on every write.
- Per-user isolation: every query is scoped to the signed-in user; ids are random.
- Files are saved under random names outside the web root; type is decided from the file's real bytes (not its name), so HTML/scripts can't be uploaded as "images".
- Strict CSP (no inline script), `nosniff`, no framing, `no-referrer`, `noindex`.
- Notes are rendered as text only (no HTML injection).

## Deploy safely (home PC / small VPS)
1. Keep the app on `127.0.0.1` and put **Caddy** (automatic HTTPS) in front, or reach it only via **Tailscale/WireGuard** so it is never exposed to the open internet (the strongest option for two people).
   ```
   # Caddyfile
   vault.example.com { reverse_proxy 127.0.0.1:3000 }
   ```
   Then run with `COOKIE_SECURE=1 TRUST_PROXY=1`. Caddy streams large uploads by default; if you use nginx set `client_max_body_size 0; proxy_request_buffering off;`.
2. Turn on **full-disk encryption** (LUKS/FileVault/BitLocker) so the files are encrypted at rest.
3. Run as a non-root user; `chmod 700 data`.
4. **Back up** `data/` (both `vault.db` and `files/`) to a second place, e.g. an encrypted copy on an external drive or Backblaze B2 via `restic`/`rclone`.

## Honest limits
No web app can stop a signed-in person from saving what their own screen shows. This design stops *outsiders*: no public URLs, no guessable ids, no hotlinking, no scraping without a login. Keep passwords long and unique.

## Not built yet (good next steps)
Thumbnails (grid currently loads originals; add `sharp`/`ffmpeg`), HEIC preview, chunked/resumable uploads for very large videos, TOTP two-factor login, albums, per-item sharing.
