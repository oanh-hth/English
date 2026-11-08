# Phase 0: Setup & toolchain

**Time:** 2–3 hours · **You build:** an empty Vite + React + TypeScript project under git.

## 1. Learn
- **Node.js and npm**: what each is, `node -v`, `npm -v`, `package.json`, `npm install`, `npm run`, lockfiles. Keywords: *nvm, semantic versioning, dependencies vs devDependencies*.
- **Vite**: dev server, hot reload, `npm run build`, what `dist/` contains. Keywords: *Vite react-ts template*.
- **TypeScript config**: `tsconfig.json`, `strict: true`, what the compiler checks.
- **Git**: `init`, `add`, `commit`, branches, `.gitignore`.

## 2. Study the finished app
- `index.html`: notice there is no build step; scripts load directly.
- `.gitignore` and `README.md` at the repo root: what is deliberately kept out of git.

## 3. Exercise
Create a project: `npm create vite@latest speak-natural -- --template react-ts`.

- [ ] `npm run dev` shows the starter page on your computer
- [ ] `npm run build` succeeds and creates `dist/`
- [ ] `tsconfig.json` has `"strict": true`
- [ ] You replace the starter page with a heading "Speak Natural"
- [ ] `.gitignore` excludes `node_modules`, `dist`, `.env`, `.env.*`
- [ ] First commit is on a branch you created with `git switch -c`
- [ ] You can open the dev server on your iPhone (same Wi-Fi, `npm run dev -- --host`)

## 4. Check yourself
1. What is the difference between `dependencies` and `devDependencies`?
2. Why is `node_modules` never committed?
3. What does Vite do that opening `index.html` directly does not?
4. Why does the finished app need no Node.js server?
