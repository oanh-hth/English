# Part 9e: Putting it online

*[Part 9: Full stack and shipping](README.md) · section e*

Your computer won't always be on. To use Threadwork anywhere, run the server on a machine that is: a hosting service, or a small computer at home. This section explains the options and what to watch for. The exercise is to do it.

## What "deploying" means here

Threadwork is one Node.js process that serves the built app and the API, and keeps data in a folder:

```
npm ci            # install exactly what package-lock.json says
npm run build     # build the app into dist/
npm start         # start the server (PORT, DATA_DIR and TOKEN_SECRET are read from the environment)
```

So any host that runs Node and keeps files between restarts will do.

## Things that matter

- **HTTPS.** Needed for the service worker, for passwords to travel safely, and for the iPad to treat it as a real app. Hosting services give you HTTPS automatically.
- **A persistent disk.** Your data lives in `DATA_DIR`. Many free hosts wipe the disk on every restart: use one with a persistent volume, and point `DATA_DIR` at it.
- **A fixed `TOKEN_SECRET`.** Set it as an environment variable (a long random string: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Never commit it to git.
- **Backups.** Settings → *Download a backup* gives you everything in one file. Do it now and then.

## Options

- **A hosting service with a disk**, for example Render, Railway or Fly.io. Connect the repository, set the build command (`npm ci && npm run build`), the start command (`npm start`), the root directory (`learn-threadwork`), a volume, and the environment variables. Check their current free tiers; they change.
- **A small computer at home** (an old laptop or a Raspberry Pi), reached from anywhere with **Tailscale**, which also gives you HTTPS. Your data never leaves your house.

## When it's done

Open your address on the iPad, sign in, and add it to the home screen again. Threadwork now works on your iPad, your computer and your phone, synced. You built every part of it.

## Read more
- Deploying Node apps (Render): <https://render.com/docs/deploy-node-express-app>
- Railway volumes: <https://docs.railway.com/reference/volumes>
- Fly.io volumes: <https://fly.io/docs/volumes/overview/>
- Tailscale HTTPS: <https://tailscale.com/kb/1153/enabling-https>
- The twelve-factor app (config in the environment): <https://12factor.net/config>

---

## Exercises 9.6

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 9.6: Deploy it so it works anywhere


Deploy Threadwork with HTTPS, a persistent data folder and a fixed `TOKEN_SECRET`. Open it on your iPad, add it to the home screen, and use it for a week. Download a backup at the end of the week.

This exercise has no automatic tests. Tick it when you've done it (change `[ ]` to `[x]`), and `npm run progress` counts it:

- [ ] **9.6** Deploy it so it works anywhere

---

[← 9d Offline and on the iPad](d-offline-and-ipad.md) · [Back to the course overview →](../../README.md)
