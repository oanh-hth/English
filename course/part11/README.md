# Part 11: CI/CD, deployment and security

**Goal.** Every push is built and tested automatically, and a passing `main` branch deploys to a public URL, with the database migrated and no secret in the repository.

**You will learn:** Docker, multi-stage builds, GitHub Actions, environment configuration, deploying a web service with a managed PostgreSQL, HTTPS, backups, and a security review.

## a. Docker

A **container** packages your app with everything it needs, so it runs the same on your laptop, in CI and on the server. A **multi-stage build** compiles in big images and ships only what is needed:

```dockerfile
FROM node:22-alpine AS front
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM node:22-alpine AS back
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend ./
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY --from=back /app/backend/dist ./dist
COPY --from=front /app/frontend/dist ./public
USER node
EXPOSE 3001
HEALTHCHECK CMD wget -qO- http://localhost:3001/api/health || exit 1
CMD ["node", "dist/index.js"]
```

Details that matter: copy `package*.json` and install **before** copying the source so Docker caches the slow step; use `npm ci` (exact lockfile versions); **never** `COPY .env` and list it in `.dockerignore` along with `node_modules`, `.git` and `dist`; run as the non-root `node` user; add a health check.

**Secrets are not baked into images.** They arrive as environment variables when the container starts. Anyone who can pull an image can read everything inside it.

### Exercises

**11.1.** Write the `Dockerfile` and `.dockerignore`. Build with `docker build -t word-garden .`.

**11.2.** Make the server serve `./public` in production (your Part 3 static handler, with the path configurable).

**11.3.** Extend `docker-compose.yml` with an `app` service that depends on `db` (with a database health check), passes `DATABASE_URL` and `JWT_SECRET` from your **`.env` file** (not written in the compose file), and runs migrations before starting. Open `http://localhost:3001` and sign up.

**11.4.** Run `docker history word-garden` and `docker image ls`. How big is the image? Remove one thing that does not need to be there and compare.

**11.5.** Prove no secret is in the image: `docker run --rm word-garden env` and `docker run --rm word-garden ls -la`. Explain what you looked for.

## b. GitHub Actions

**Continuous integration** means every push is built and tested by a machine, so broken code is caught within minutes. A **workflow** is a YAML file in `.github/workflows/`. It starts **jobs** on fresh virtual machines. A job runs **steps**.

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_USER: garden, POSTGRES_PASSWORD: garden, POSTGRES_DB: wordgarden_test }
        ports: ['5433:5432']
        options: >-
          --health-cmd "pg_isready -U garden" --health-interval 5s --health-timeout 5s --health-retries 10
    env:
      NODE_ENV: test
      DATABASE_URL: postgres://garden:garden@localhost:5433/wordgarden_test
      JWT_SECRET: ci-only-secret-not-used-anywhere-else-0123456789
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm, cache-dependency-path: '**/package-lock.json' }
      - run: npm ci --prefix backend
      - run: npm ci --prefix frontend
      - run: npm run lint --prefix backend && npm run lint --prefix frontend
      - run: npm run typecheck --prefix backend && npm run typecheck --prefix frontend
      - run: npm test --prefix backend
      - run: npm test --prefix frontend
      - run: npm run build --prefix frontend
      - run: npx playwright install --with-deps chromium
        working-directory: e2e
      - run: npm test
        working-directory: e2e
      - if: failure()
        uses: actions/upload-artifact@v4
        with: { name: playwright-report, path: e2e/playwright-report }
```

Notes: the values in `env:` here are **throwaway test values for a throwaway database**, which is fine to commit. **Real secrets** (a deploy hook, a production database URL) live in **GitHub → Settings → Secrets**, referenced as `${{ secrets.NAME }}`, and are masked in logs. Pin actions to a major version (or a commit SHA for the paranoid). **Protect `main`**: require the `test` job to pass and a pull request before merging.

### Exercises

**11.6.** Add the workflow above, adjusted to your folder names and scripts. Push a branch and open a pull request. Watch it run.

**11.7.** Make it fail on purpose (break one test) and read the log until you find the failing line. Fix it.

**11.8.** Add `npm audit --omit=dev --audit-level=high` as a step, and turn on **Dependabot** (`.github/dependabot.yml`) for npm and GitHub Actions.

**11.9.** Protect `main` in the repository settings (required status check, pull request required). Try to push straight to `main` and see it refused.

**11.10.** Add a deploy job (next lesson) that runs only on `main`, only after `test` succeeds (`needs: test`, `if: github.ref == 'refs/heads/main'`).

## c. Deploy and harden

A simple path is a container platform with a managed PostgreSQL, for example **Render** (a web service built from your `Dockerfile` plus a PostgreSQL instance) or **Fly.io**. Free plans, limits and prices change often and a free database may be deleted after a period, so read the current plan page before relying on one, and treat anything you care about as needing a paid database with backups.

The shape of a deployment:

1. **Create the database** on the platform. Copy its internal connection string.
2. **Create the web service** from your repository (Docker). Set environment variables in the dashboard, **not** in a file: `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET` (generated: `openssl rand -base64 48`), `PORT` if required.
3. **Migrations.** Run `node dist/migrate.js up` as a **release step** before the new version starts. If the platform has no release step, run them at start-up and take a **PostgreSQL advisory lock** so two instances do not migrate at once. Migrations must be **backward compatible** with the previous code, because old and new versions run side by side during a deploy (add a column first, use it later, drop it last).
4. **HTTPS** is automatic on these platforms. Set `app.set('trust proxy', 1)` so the rate limiter sees real client IPs and cookies and redirects know the protocol.
5. **Database SSL.** A connection from outside the platform's private network usually needs `dialectOptions: { ssl: { require: true } }`.
6. **Health check** path `/api/health`.
7. **Backups and restore.** A backup you have never restored is a hope, not a backup.
8. **Logs and errors.** Log one JSON line per request and per error, with no passwords, tokens or note text. Look at logs when something breaks, so know where they are *before* it does.

**Offline and install (PWA).** A `manifest.webmanifest` and a small **service worker** make the app installable and let the shell load offline. Cache the static assets. For API calls, use **network-first** and **never cache another user's data**: a service worker cache is shared by everyone using that browser. Bump the cache name on each release so users get updates.

### The security checklist

Go through it for your own app and tick each with evidence:

- [ ] **Injection:** every query uses bind parameters or Sequelize methods. No string-built SQL with user input.
- [ ] **Broken access control:** every data query includes the owner. Tested in the Part 10 matrix.
- [ ] **Authentication:** bcrypt, rate-limited login, JWT secret only in the environment, tokens expire.
- [ ] **XSS:** React escapes text. No `dangerouslySetInnerHTML`. A Content Security Policy is set with `helmet`.
- [ ] **Secrets:** nothing in git history (`git log -p | grep -iE 'secret|password|token'`). Image has none. CI uses secrets, not values.
- [ ] **Dependencies:** `npm audit` clean for production dependencies, Dependabot on.
- [ ] **Transport:** HTTPS only, `trust proxy` set, secure headers.
- [ ] **Data:** export, delete-account, backups, and a privacy line in the UI.
- [ ] **Limits:** body size, rate limits, upstream timeouts.

### Exercises

**11.11.** Create the database and web service on your chosen platform. Set the environment variables in the dashboard.

**11.12.** Make migrations run as a release step (or at start-up with an advisory lock). Deploy and check the `migrations` table.

**11.13.** Open the live URL on your phone, sign up, add notes, install it to the home screen, and check that the weather works over HTTPS.

**11.14.** Add the manifest, icons and a service worker (by hand or with `vite-plugin-pwa`). Test offline mode in the browser dev tools. Make sure API responses are not cached across users: log in as two users on one browser to prove it.

**11.15.** Connect the deploy to CI (the job from 11.10, using a deploy hook stored as a GitHub secret).

**11.16.** Practice a **restore**: take a backup of the production database, restore it into a fresh local database and check that you can sign in.

**11.17.** Work through the security checklist above with evidence for every line. Fix what fails.

**11.18.** Write `docs/RUNBOOK.md`: how to deploy, roll back, rotate the JWT secret (and what that does to logged-in users), restore a backup, and where the logs are.

## Checkpoint 11

- [ ] Every pull request runs lint, typecheck, tests and E2E automatically.
- [ ] A merge to `main` deploys, runs migrations and serves the app over HTTPS.
- [ ] No secret is in git, in the image, or in the workflow files. You rotated any that ever were.
- [ ] You restored a backup at least once. The runbook exists.

Tag it: `git tag part11`. Put the live URL in the repository description.
