# Part 9d: Offline and on the iPad

*[Part 9: Full stack and shipping](README.md) · section d*

Threadwork should feel like an app on the iPad: an icon on the home screen, full screen, and still working on a plane. That's a **Progressive Web App (PWA)**. In this section you write the caching rule of its service worker, then install it.

## The pieces of a PWA

- A **web app manifest** (`public/manifest.webmanifest`, given): the name, icons, colours, and `"display": "standalone"` so it opens without Safari's address bar.
- Apple-specific tags in `index.html` (given): the home-screen icon (`apple-touch-icon`) and the title.
- A **service worker** (`src/sw.ts`, given, using your function): a small script that sits between the app and the network, and can answer requests from a cache when you're offline.

## Caching strategies

A service worker decides, per request, where the answer comes from:

- **network first**: try the network, keep a copy, and use the copy only when offline. Right for the app's own files: updates appear when you're online.
- **cache first**: use the copy if there is one. Right for files that never change, like fonts.
- **skip**: don't touch it. Right for the API: your data must be live, and sync handles offline changes. Also right for other sites, and for anything that isn't a `GET`.

That decision is a pure function, `strategyFor(method, url, appOrigin)`, so you can test it without a browser. Compare **origins** (scheme + host + port), not "contains": `https://me.example.evil.com` is not your app.

## Service workers only in production

In development, a cache would serve old versions of the files you're editing. The given `main.tsx` registers the service worker only in the built app (`import.meta.env.PROD`). To try it:

```
npm run build
npm start          # one server: the app and the API on http://localhost:3001
```

## Installing on the iPad

The iPad must reach your server. On the same Wi-Fi, use your computer's local address (System Settings → Wi-Fi → Details on a Mac, or `ipconfig` on Windows), for example `http://192.168.1.20:3001`. Safari only enables service workers on **HTTPS** sites (or localhost), so the full offline experience arrives when you deploy (9e). Adding to the home screen works either way.

## Read more
- Progressive web apps (MDN): <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps>
- Service worker API (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API>
- Caching strategies: <https://web.dev/learn/pwa/serving>
- Web app manifest (MDN): <https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest>

---

## Exercises 9.4–9.5

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 9.4: How the service worker caches

**Edit:** `app/client/src/pwa/strategy.ts` · **Tests:** `tests/part-9/9.4-offline.test.ts` · **Run:** `npm run ex 9.4`

Write `strategyFor(method, url, appOrigin)`: skip non-GET requests, skip `/api/`, network-first for the app's own files, cache-first for Google Fonts, skip everything else.

### 9.5: Install Threadwork on your iPad


Run `npm run build` and `npm start` on your computer. On the iPad, open Safari at your computer's address and port 3001, sign in, then tap **Share → Add to Home Screen**. Open Threadwork from the home screen: it runs full screen. Draw a sketch with the pencil, finish a task, and watch your plant grow.

This exercise has no automatic tests. Tick it when you've done it (change `[ ]` to `[x]`), and `npm run progress` counts it:

- [ ] **9.5** Install Threadwork on your iPad

---

[← 9c Signing in](c-sign-in.md) · [9e Putting it online →](e-deploy.md)
