# 8a: PWA and offline

A **Progressive Web App** is a website that can be installed and can work offline. Three ingredients:

1. **HTTPS** (GitHub Pages provides it).
2. A **web app manifest**: name, icons, how to open.
3. A **service worker**: a script that sits between your page and the network and can answer requests from a cache.

## The manifest

```json
{
  "name": "Speak Natural",
  "short_name": "Speak Natural",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#f6f7fb",
  "theme_color": "#3b6cf6",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- `display: standalone` removes browser chrome.
- Use **relative** `start_url` and `scope` so it works under `/repo-name/` on GitHub Pages.
- **iOS needs extra tags** in `index.html`: `<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">` (180×180) and `<meta name="apple-mobile-web-app-capable" content="yes">`. There is no install popup on iPhone: the user taps Share → Add to Home Screen.

## Service workers, conceptually

A service worker has a life cycle:

- **install**: fires once when a new version is found. Pre-cache files here.
- **activate**: the new version takes over. Delete old caches here.
- **fetch**: fires for every request your page makes. You decide: answer from cache, from the network, or both.

Strategies:

| Strategy | Good for | Trade-off |
|---|---|---|
| **Cache first** | fonts, images, hashed JS/CSS | fast and offline, but may serve old files |
| **Network first, cache fallback** | HTML and data you change | fresh when online, works offline |
| **Stale while revalidate** | content where slightly old is OK | instant, then updates in the background |

The famous trap: a **cached service worker file or app shell that never updates**, leaving users on an old version for weeks. Always plan how updates arrive (versioned cache names, `skipWaiting`, a "new version available" prompt).

## Don't hand-write it: `vite-plugin-pwa`

```bash
npm i -D vite-plugin-pwa
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/speak-natural/', // your repo name (Part 8c)
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Speak Natural',
        short_name: 'Speak Natural',
        start_url: '.',
        display: 'standalone',
        background_color: '#f6f7fb',
        theme_color: '#3b6cf6',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg,json}'] },
    }),
  ],
});
```

The plugin generates the service worker (using **Workbox**), pre-caches every file the build produces under hashed names, and updates it on each deploy.

PWAs only register the worker in **production builds**: use `npm run build && npm run preview` to test.

## What is (and isn't) offline

- Your code and data files: cached, so the app works offline.
- **Audio:** the browser's speech engine is on the device, so it works offline.
- **localStorage:** survives offline and across launches, but iOS can clear a website's storage if it's unused for a long time. That's why Part 7 added export.
- External services (dictionary lookup, YouGlish) need the network; handle failure kindly.

## Exercises

**8.1** Make icons (180, 192, 512 px) and the manifest; add the iOS tags. Check them in Chrome DevTools → Application → Manifest.

**8.2** Add `vite-plugin-pwa` with the config above (adjust names). Run `npm run build && npm run preview` and verify in DevTools → Application → Service Workers that it is active.

**8.3** Test offline: with DevTools "Offline" ticked, reload. Then on your real iPhone (use the deployed site from 8c, or your computer's address over Wi-Fi for a first test), switch on airplane mode and open the installed app.

**8.4** Prove updates arrive: change the heading text, rebuild, redeploy (or rebuild locally), reload twice, and confirm the new text appears. Write down in `notes.md` what you'd do if users reported being stuck on an old version.

**8.5** Make the dictionary lookup (if you built it) fail gracefully offline: a friendly message and the form still usable.
