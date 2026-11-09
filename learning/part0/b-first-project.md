# 0b: Your first Vite + React + TypeScript project

## Why Vite

Browsers understand HTML, CSS and JavaScript, but not TypeScript or JSX. **Vite** is a tool that, while you develop, compiles your files on the fly and refreshes the page when you save; and for production it **bundles** everything into a small set of static files.

Create the project (replace your empty folder, or run it one level up):

```bash
npm create vite@latest speak-natural -- --template react-ts
cd speak-natural
npm install
npm run dev
```

Open the address it prints (usually `http://localhost:5173`).

## Tour of the files

| File | What it is |
|---|---|
| `index.html` | The only HTML page. It has `<div id="root">` and loads `src/main.tsx` |
| `src/main.tsx` | Starts React and mounts `<App />` into `#root` |
| `src/App.tsx` | Your first component |
| `vite.config.ts` | Vite settings (you'll set `base` and add a PWA plugin later) |
| `tsconfig.json` (and friends) | How TypeScript checks your code |
| `package.json` | Scripts and dependencies |

`main.tsx` looks like this:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`StrictMode` makes React run some code twice in development to expose bugs. Don't be surprised by double logs.

## TypeScript strictness

Open the tsconfig that applies to `src` (`tsconfig.app.json` in recent templates) and confirm `"strict": true`. Strict mode turns on the checks that catch real bugs: no hidden `any`, null checks, and more. Turn it on from day one; adding it later is painful.

## Two commands you'll use constantly

```bash
npm run dev      # development server with hot reload
npm run build    # type-checks, then writes the production files to dist/
```

`npm run build` fails on type errors. That's a feature.

## Test on your phone

```bash
npm run dev -- --host
```

Vite prints a "Network" URL like `http://192.168.1.20:5173`. Open it on your phone (same Wi-Fi). Real-device testing from day one saves you from surprises about screen size and audio.

## Exercises

**0.5** Create the project as shown. Replace the starter page so `App` renders only `<h1>Speak Natural</h1>` and a one-line subtitle. Delete unused starter files and CSS.

**0.6** Run `npm run build`. Open `dist/` and note the files it created. Write in `notes.md` why the app doesn't need Node.js to run in production.

**0.7** Open the dev server on your phone with `--host`. Take a screenshot and keep it in `notes.md`.

**0.8** Commit everything to git on a branch named `part0`, then `git tag part0-start`. Confirm that `node_modules` and `dist` are not committed (`git status` should be clean).
