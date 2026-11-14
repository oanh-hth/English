const CACHE = 'listen-learn-v2';
const FILES = ['./', 'index.html', 'styles.css', 'core.js', 'transcript.js', 'lexicon.js', 'analyze.js', 'exercises.js', 'player.js', 'notes.js', 'sources.js', 'views.js', 'session.js', 'claude.js', 'boot.js', 'vendor/anthropic-sdk.js', 'manifest.webmanifest', 'fonts/syne-latin-800-normal.woff2', 'fonts/syne-latin-700-normal.woff2', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Same-origin only (YouTube and other hosts are never cached). Network first so updates show up; cache when offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
