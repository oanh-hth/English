# Threadwork

A todo list that remembers what you learned. Built for iPad (installable from Safari) and computer.

- **Simple tasks** you just tick off.
- **Complex tasks** end with a short write-up: the **result** (what happened, what you found out) and your **decision** (what you chose, and why), filed under a **web development category**.
- **Decisions** shows everything you've decided. Filter by group (Frontend, Backend, Workflow), by category (HTML, CSS, Layout, Accessibility, React, State management, Performance, Testing, PWA, Node.js, APIs, Deployment…) or by text, and export it all as Markdown.
- A weekly summary on the task list: to do, overdue, done today and this week, decisions this week, and the topic you decided about most.

No build step and no server of its own: a static web app with optional sync through your own Firebase project.

The same app is built step by step, in TypeScript, React and Node.js, in the course in [`../learn-threadwork`](../learn-threadwork/README.md).

## Run it locally
From the repository root:
```
python3 -m http.server 8000
```
Open http://localhost:8000/threadwork/

## Put it on your iPad
1. Host the repository on GitHub Pages (see the main README). The app is then at `https://<user>.github.io/<repo>/threadwork/`.
2. Open that address in Safari on the iPad and tap **Share → Add to Home Screen**.
3. Open Threadwork from the home screen and create your account. **Settings → Add example tasks** shows what a filled-in decision log looks like.

## Sign-in and where your data lives
- **Without sync (default)**: everything is saved on the device in IndexedDB. Your password locks the app on that device. It is stored only as a salted PBKDF2 hash and it cannot be recovered. It does not encrypt the data. Use **Settings → Backup** to download a copy regularly.
- **With sync**: you sign in with an account in your own Firebase project, and the same data appears on your iPad and your computer. Sync works on the free Spark plan.

### Set up sync (about 10 minutes, once)
1. Go to https://console.firebase.google.com and **Add project** (Google Analytics is not needed).
2. **Build → Authentication → Get started → Email/Password → Enable → Save.**
3. **Authentication → Settings → Authorized domains → Add domain**: your GitHub Pages domain, for example `oanh-hth.github.io`.
4. **Build → Firestore Database → Create database**, production mode, pick a location near you.
5. **Firestore → Rules**, replace everything with the rules below and **Publish**:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
6. **Project settings (gear) → General → Your apps → Web (`</>`)**, register an app called Threadwork (no Hosting needed) and copy the `firebaseConfig` block.
7. In Threadwork: **Settings → Sync → paste the config → Connect sync**, then **Create account**. On your second device, paste the same config and **Sign in**.
8. Optional but recommended: once your account exists, **Authentication → Settings → User actions → untick "Enable create (sign-up)"** so nobody else can create an account in your project.

The Firebase web config identifies your project; it is not a password. Access is protected by the rules above. The config is kept in the browser only and is never committed to this repository.

When you connect a device that already has data and the account also has data, Threadwork asks which copy to keep. After that, the newest save wins. If you edit on both devices while one is offline, the device that saves last wins for the whole state, so let a device sync before switching.

Limits: one sync document holds all text data (up to about 1 MB, which is thousands of tasks and notes).

## Categories
The list is in `js/categories.js`: 21 frontend topics, 6 backend and 7 workflow. Tasks store the category **id**, so you can rename a category without breaking saved decisions. Add your own topics whenever something is missing.

## Data from the earlier version
If this device used the earlier Threadwork (with notes, sketches and the garden), its tasks are kept and become simple tasks. The other data is no longer shown. Download a backup first if you want to keep it.

## Files
| File | What it does |
|---|---|
| `index.html`, `styles.css` | Page shell and styles |
| `js/app.js` | Pages (Tasks, Decisions, Settings), the outcome form, sign-in screens, sync wiring |
| `js/logic.js` | The rules: tasks, outcomes, decisions, filters, weekly summary, Markdown export |
| `js/categories.js` | The decision categories |
| `js/store.js`, `js/db.js` | Saving on the device (IndexedDB) |
| `js/auth.js` | Local account (PBKDF2 password hash, 30-day session) |
| `js/cloud.js` | Optional Firebase sync (loaded only when configured) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline support and home-screen install |

When you change a file, bump `CACHE` in `sw.js` so installed copies pick up the update.
