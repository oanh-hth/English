import { strategyFor } from "@app/client/src/pwa/strategy";

const app = "https://me.example";
describe("strategyFor", () => {
  it.each([
    ["GET", "https://me.example/", "network-first"],
    ["GET", "https://me.example/assets/index-abc.js", "network-first"],
    ["get", "https://me.example/icons/icon-192.png", "network-first"],
    ["GET", "https://me.example/api/state", "skip"],
    ["PUT", "https://me.example/api/state", "skip"],
    ["POST", "https://me.example/", "skip"],
    ["GET", "https://fonts.gstatic.com/s/font.woff2", "cache-first"],
    ["GET", "https://fonts.googleapis.com/css2?family=X", "cache-first"],
    ["GET", "https://api.open-meteo.com/v1/forecast", "skip"],
    ["GET", "https://me.example.evil.com/", "skip"],
  ] as const)("%s %s -> %s", (method, url, out) => expect(strategyFor(method, url, app)).toBe(out));
});
