/// <reference lib="webworker" />
// Given: the service worker. It uses your strategyFor (9.4) to decide how to answer each request offline.
import { strategyFor } from "@app/client/src/pwa/strategy";

declare const self: ServiceWorkerGlobalScope;
const CACHE = "threadwork-v1";

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(["/", "/manifest.webmanifest"])).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("threadwork-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function networkFirst(req: Request): Promise<Response> {
  try {
    const res = await fetch(req);
    if (res.ok) { const copy = res.clone(); void caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  } catch {
    return (await caches.match(req)) ?? (await caches.match("/")) ?? Response.error();
  }
}
async function cacheFirst(req: Request): Promise<Response> {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  const copy = res.clone(); void caches.open(CACHE).then(c => c.put(req, copy));
  return res;
}

self.addEventListener("fetch", e => {
  let strategy = "skip";
  try { strategy = strategyFor(e.request.method, e.request.url, self.location.origin); } catch { /* exercise 9.4 not done yet */ }
  if (strategy === "network-first") e.respondWith(networkFirst(e.request));
  else if (strategy === "cache-first") e.respondWith(cacheFirst(e.request));
});
