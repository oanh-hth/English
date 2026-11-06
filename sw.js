const CACHE = 'speak-natural-v11';
const FILES = ['./', 'index.html', 'styles.css', 'app.js', 'units.js', 'units-ui.js', 'resources.js', 'resources-ui.js', 'claude-ui.js', 'vendor/anthropic-sdk.js', 'data.js', 'data2.js', 'data3.js', 'data4.js', 'data5.js', 'data6.js', 'data7.js', 'data8.js', 'vocab1.js', 'vocab2.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// network-first so updates show up, falling back to cache when offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
