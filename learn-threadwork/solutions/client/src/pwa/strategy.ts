export type Strategy = "network-first" | "cache-first" | "skip";

export function strategyFor(method: string, url: string, appOrigin: string): Strategy {
  if (method.toUpperCase() !== "GET") return "skip";
  const u = new URL(url, appOrigin);
  if (u.origin === appOrigin) return u.pathname.startsWith("/api/") ? "skip" : "network-first";
  if (u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") return "cache-first";
  return "skip";
}
