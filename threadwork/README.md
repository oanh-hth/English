# Threadwork

A personal workspace for iPad (with Apple Pencil) and computer. Tasks, notes, drafts, small data tables, sketches and resources all link to each other. A garden rewards you: every finished task waters your plant, and more important tasks make it grow faster.

- **Today**: what's due, your inbox of captured tasks, your plant and a quote.
- **Tasks**: Inbox / Doing / Done board. Open a task to set importance, link related tasks, attach resources (tick the ones you used), notes, drafts, data tables and sketches.
- **Link map**: every task with its notes, sketches and resources, drawn as a map.
- **Sketch**: made for Apple Pencil. Pressure changes the line, and your palm is ignored once a pencil is detected.
- **Notes & drafts**: quick notes (turn one into a task), long drafts, and data tables.
- **Resources**: files, links, tools, books and people, and which tasks use them.
- **Inspiration**: pinned quotes, goals and pictures, a wins wall, a 25-minute focus timer and your weekly growth.
- **Garden**: your plant grows by importance (Low +8%, Medium +15%, High +25%, Critical +40%, focus session +3%). Harvest at 100%, unlock new plants, and trade fruit for treats. The sky shows the live weather where you are.

No build step and no server of its own. It is a static web app that installs on iPad as an app.

## Run it locally
From the repository root:
```
python3 -m http.server 8000
```
Open http://localhost:8000/threadwork/

## Put it on your iPad
1. Host the repository on GitHub Pages (see the main README). The app is then at `https://<user>.github.io/<repo>/threadwork/`.
2. Open that address in Safari on the iPad, tap **Share → Add to Home Screen**.
3. Open Threadwork from the home screen and create your account.

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

Limits: one sync document holds all text data (up to about 1 MB, which is thousands of tasks and notes). Each sketch or picture is its own document.

## Weather
**Settings → Weather** uses your location or a city you search for. Weather comes from [Open-Meteo](https://open-meteo.com) (free, no key) and refreshes every 30 minutes while the app is open. Only the coordinates are sent. Without a location, the garden is sunny and uses your clock for day and night. You can always pick a weather by hand in **Garden → Scene**.

## Files
| File | What it does |
|---|---|
| `index.html`, `styles.css` | Page shell and styles |
| `js/app.js` | Views, actions, sign-in screens, settings, sync wiring |
| `js/plant.js` | Plant drawing, sky scenes, watering animation |
| `js/sound.js` | Synthesised sounds (pouring, chimes, rain) |
| `js/store.js`, `js/db.js` | Saving on the device (IndexedDB), pictures stored separately |
| `js/auth.js` | Local account (PBKDF2 password hash, 30-day session) |
| `js/cloud.js` | Optional Firebase sync (loaded only when configured) |
| `js/weather.js` | Open-Meteo weather and city search |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline support and home-screen install |

When you change a file, bump `CACHE` in `sw.js` so installed copies pick up the update.
