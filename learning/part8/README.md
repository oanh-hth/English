# Part 8: Offline, tests and deployment

You turn the app into something you can **install on your phone, use offline, trust with automated tests, and ship from GitHub**, without leaking a secret.

| Lesson | Topic | Exercises |
|---|---|---|
| [a](a-pwa-offline.md) | PWA and offline | 8.1 – 8.5 |
| [b](b-testing.md) | Component and end-to-end tests | 8.6 – 8.11 |
| [c](c-deploy.md) | Deploying with GitHub Actions and Pages | 8.12 – 8.15 |
| [d](d-security.md) | Secrets and security hygiene | 8.16 – 8.20 |

## Checkpoint 8

- [ ] The app installs to your iPhone Home Screen and opens full screen
- [ ] In airplane mode it opens and works
- [ ] Unit, component and end-to-end tests pass with `npm test` and `npm run e2e`
- [ ] Every push to `main` runs the tests, builds and deploys to GitHub Pages
- [ ] The live site works, including after a refresh on an inner page
- [ ] No secrets in the repo or its history; `.gitignore` is correct
- [ ] `git tag part8`

## Reference files to compare afterwards
`manifest.webmanifest`, `sw.js`, `icons/`, `index.html` (meta tags), `.gitignore`, `README.md` (Pages steps), `tools/validate.js`.
