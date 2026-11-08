# Phase 11: Deploy & security

**Time:** 3–5 hours · **You build:** an automatic deploy to GitHub Pages, with no secrets in the repo.

## 1. Learn
- **Static hosting**: what GitHub Pages serves, the `/<repo>/` sub-path, Vite's `base` option.
- **GitHub Actions**: a workflow that installs, tests, builds and deploys on every push to `main`.
- **Secrets**: why `.env` files and API keys never go in git; why `VITE_*` variables are public; revoking a leaked key.
- **Dependency hygiene**: `npm audit`, lockfiles, pinning versions.
- **Privacy**: what your app stores on the device and what it sends out.

## 2. Study the finished app
- `README.md` (deploy steps), `.gitignore` (secret patterns) and `.nojekyll`.
- `claude-ui.js`: how a bring-your-own-key approach keeps the key out of the repo, and why it is still only for personal use.

## 3. Exercise
- [ ] `vite.config.ts` sets `base` to your repo path
- [ ] A GitHub Actions workflow runs tests, builds and deploys to Pages
- [ ] The live URL works, including a refresh on a sub-page
- [ ] The build fails if tests fail
- [ ] You searched your whole git history for key-like strings (`git log -p -S"sk-"`) and found none
- [ ] `.gitignore` blocks `.env`, `.env.*`, `*.key`
- [ ] You can explain what to do in the first five minutes after leaking a key

## 4. Check yourself
1. Why can't a browser app keep a secret?
2. What does "revoke" do that "delete the file" does not?
3. What would you need to change to host at a custom domain?
4. How would you roll back a bad deploy?
