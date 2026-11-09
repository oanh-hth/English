// Exercise 9.4: How the service worker caches. Read curriculum/part-9/d-offline-and-ipad.md first.
export type Strategy = "network-first" | "cache-first" | "skip";

/**
 * - Anything that isn't GET: "skip".
 * - Same origin and the path starts with "/api/": "skip" (always live data; the app has its own sync).
 * - Same origin, anything else (the app's HTML, JS, CSS, icons): "network-first" (updates show up when online).
 * - Google Fonts (fonts.googleapis.com, fonts.gstatic.com): "cache-first" (they never change).
 * - Any other site: "skip".
 */
export function strategyFor(method: string, url: string, appOrigin: string): Strategy {
  // TODO 9.4
  throw new Error("TODO 9.4");
}
