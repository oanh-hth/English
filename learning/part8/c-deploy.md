# 8c: Deploying with GitHub Actions and Pages

## What GitHub Pages serves

A **static** file host: it serves the contents of a folder over HTTPS at `https://<user>.github.io/<repo>/`. Your build output (`dist/`) is exactly that.

Two consequences:

1. The site lives under **`/<repo>/`**, not `/`. Tell Vite: `base: '/speak-natural/'` in `vite.config.ts`. (Use your real repo name.) Without it, JS and CSS URLs break.
2. There's **no server-side routing fallback**, so refreshing `/topics` would 404 with browser-history URLs. That's why the app uses the **hash router** (`/#/topics`).

## Continuous integration and deployment

**CI** runs your checks automatically on every push. **CD** deploys automatically when they pass. GitHub Actions does both with a YAML file in `.github/workflows/`:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run validate
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Reading it:

- `on.push.branches` runs on pushes to `main`.
- `permissions` give the job only what it needs (**least privilege**).
- `npm ci` installs exactly what the lockfile says (reproducible, unlike `npm install`).
- If `validate`, `test` or `build` fails, the job stops and **nothing is deployed**. That's the point.
- `deploy` runs only after `build` succeeds.

In the repo's **Settings → Pages**, set **Source = GitHub Actions**.

## Branches and releases

A simple workflow for a solo project:

1. Work on a branch (`part8-deploy`), commit often.
2. Open a pull request into `main`; let CI run the tests on it.
3. Merge; the deploy workflow runs; check the live URL.
4. **Rolling back**: revert the commit on `main` (`git revert <sha>`) and push; the pipeline redeploys the previous version.

Tags (`part1` ... `part8`) mark your course checkpoints.

## Exercises

**8.12** Set `base` in `vite.config.ts` to your repo name. Run `npm run build && npm run preview` and open the preview URL with the sub-path to make sure assets load.

**8.13** Add the workflow above. Push to a branch, open a PR, and watch the checks run in the **Actions** tab. Break a test on purpose, see the failure, and fix it.

**8.14** Set Pages source to **GitHub Actions**, merge to `main`, and open the live URL. Test a refresh on an inner page (`/#/unit/...`), the offline behaviour, and installing to the Home Screen from the live site.

**8.15** Practice a rollback: deploy a deliberately bad change (for example a broken heading), then `git revert` it and confirm the site recovers. Write down the steps in `notes.md`.
