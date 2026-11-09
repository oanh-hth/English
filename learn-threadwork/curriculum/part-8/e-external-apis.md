# Part 8e: Calling other services

*[Part 8: A Node.js server](README.md) · section e*

The garden's sky shows the real weather where you are. The server fetches it from **Open-Meteo**, a free weather service that needs no key, and caches it. In this section you call another service from your server.

## Why through your server?

The browser could call Open-Meteo directly. Going through your server means one place to change providers, one place to cache, and the app's code only ever talks to your own API. With a paid weather service, it would also keep your key secret.

## `fetch` in Node

Node 20 has `fetch` built in:

```ts
const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=10.82&longitude=106.63&current=weather_code,wind_speed_10m,is_day,temperature_2m`);
if (!res.ok) throw new Error(`Weather service error ${res.status}`);
const { current } = await res.json();
```

`current.weather_code` is a WMO code (0 clear, 61 rain, 73 snow…). Map it to the five scenes the garden can draw.

## Inject what you don't control

The service takes `fetchFn` and `now` as parameters. Tests pass fakes: a fetch that returns a rainy reply without touching the internet, and a clock they can move forward. The real server passes the real `fetch` and `Date.now`.

## Caching

The weather doesn't change every second. Keep answers in a `Map` for 30 minutes, keyed by rounded coordinates:

```ts
const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;     // ~1 km: close enough to share
const hit = cache.get(key);
if (hit && now() - hit.at < ttlMs) return hit.value;
```

Fewer calls means a faster app, kinder use of a free service, and fewer failures.

## Validate query strings, and report upstream failures

`req.query.lat` is a string (or missing). Convert it, check it's a real number, and check the range (latitude ±90, longitude ±180). If Open-Meteo itself fails, that's not your client's fault and not a crash: answer **502 Bad Gateway**.

## Read more
- Open-Meteo API docs: <https://open-meteo.com/en/docs>
- WMO weather codes: <https://open-meteo.com/en/docs#weather_variable_documentation>
- `fetch` in Node: <https://nodejs.org/en/learn/getting-started/fetch>
- HTTP 502 (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/502>

---

## Exercises 8.5

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 8.5: Weather from Open-Meteo with a cache

**Edit:** `app/server/src/weather.ts` · **Tests:** `tests/part-8/8.5-weather.test.ts` · **Run:** `npm run ex 8.5`

Write `weatherKind`, `createWeatherService(fetchFn, ttlMs, now)` with its cache, and `weatherRouter`. After this, set your location in Settings and the garden's sky follows the real weather.

---

[← 8d Saving data on the server](d-storage.md) · [Part 9: Full stack and shipping →](../part-9/README.md)
