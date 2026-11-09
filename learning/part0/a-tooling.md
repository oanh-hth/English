# 0a: Node.js, npm and git

## What Node.js is (and isn't, here)

JavaScript was made to run inside web browsers. **Node.js** lets JavaScript run on your computer, outside a browser. In this course Node is your **toolbox**: it runs the development server, the compiler, the test runner and the build. The finished app does **not** need Node to run for users; it is a folder of static files.

Install Node from nodejs.org (use the current LTS version). Check it:

```bash
node -v      # e.g. v22.x
npm -v
```

## npm and `package.json`

**npm** is Node's package manager. A project describes itself in `package.json`:

```json
{
  "name": "speak-natural",
  "private": true,
  "scripts": { "dev": "vite", "build": "vite build", "test": "vitest run" },
  "dependencies": { "react": "^19.0.0" },
  "devDependencies": { "typescript": "^5.6.0", "vitest": "^2.1.0" }
}
```

- **dependencies** ship with your app (React). **devDependencies** are only tools (TypeScript, test runner).
- `^5.6.0` is **semantic versioning**: `major.minor.patch`. The caret allows minor and patch updates but not a new major version, which may break your code.
- `npm install` reads `package.json`, downloads packages into `node_modules/`, and writes `package-lock.json`, which pins the exact versions. **Commit the lockfile. Never commit `node_modules/`.**
- `npm run dev` runs the script named `dev`.

## Git in five commands

Git records snapshots of your project so you can undo mistakes.

```bash
git init                      # start tracking this folder
git add -A                    # stage all changes
git commit -m "Describe it"   # save a snapshot
git switch -c part1           # make and enter a new branch
git log --oneline             # see history
```

A **`.gitignore`** lists things git must never track:

```
node_modules/
dist/
.env
.env.*
*.key
.DS_Store
```

Learn to read `git status` and `git diff` before every commit. A commit that contains something you didn't expect is how secrets leak.

## Exercises

**0.1** Install Node (LTS) and git. Paste the output of `node -v`, `npm -v` and `git --version` into a file `notes.md` in a new folder `speak-natural`.

**0.2** In that folder run `npm init -y`. Open `package.json`. Add a script `"hello": "node -e \"console.log('hello')\""` and run it with `npm run hello`.

**0.3** Run `git init`, create a `.gitignore` with the lines above, and make your first commit containing `notes.md`, `package.json` and `.gitignore`.

**0.4** Answer in `notes.md`, in your own words: (1) the difference between `dependencies` and `devDependencies`; (2) why `node_modules` is not committed; (3) what the caret in `^5.6.0` allows.
