# Phase 9: PWA & offline

**Time:** 4–6 hours · **You build:** an installable app that works with no network.

## 1. Learn
- **Web app manifest**: name, icons, `display: standalone`, `start_url`, theme colours.
- **Service workers**: install, activate, fetch events, the cache API. Keywords: *cache-first, network-first, stale-while-revalidate*.
- **Updating a service worker**: why users can be stuck on an old version and how cache names fix it.
- **iOS specifics**: `apple-touch-icon`, Add to Home Screen, no install prompt, storage can be cleared.
- **Tooling**: `vite-plugin-pwa` (Workbox) so you don't hand-write the worker.

## 2. Study the finished app
- `manifest.webmanifest`, `sw.js` (the `CACHE` name and file list) and the `icons/` folder.
- Note the rule that the worker ignores cross-origin requests.

## 3. Exercise
- [ ] Manifest and icons (180, 192, 512 px) added
- [ ] Service worker caches the app shell and data files
- [ ] Turn on airplane mode and the app still opens and works
- [ ] Shipping a change updates installed copies (test with a version bump)
- [ ] Added to your iPhone Home Screen and opens full screen
- [ ] You can explain what is cached and when it refreshes

## 4. Check yourself
1. What does a service worker do that a normal script can't?
2. Why did the finished app use network-first for its files?
3. What happens to localStorage if the user clears Safari data?
4. Why must a PWA be served over HTTPS?
