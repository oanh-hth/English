import { Router } from "express";

export type WeatherKind = "sun" | "cloud" | "rain" | "snow" | "wind";
export interface Weather { kind: WeatherKind; isDay: boolean; temp: number; wind: number; code: number }

export function weatherKind(code: number, windKmh: number): WeatherKind {
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return "rain";
  if (windKmh >= 30) return "wind";
  if (code >= 2) return "cloud";
  return "sun";
}

export type FetchLike = (url: string) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

interface OpenMeteo { current: { weather_code: number; wind_speed_10m: number; is_day: number; temperature_2m: number } }

export function createWeatherService(fetchFn: FetchLike, ttlMs = 30 * 60_000, now: () => number = Date.now) {
  const cache = new Map<string, { at: number; value: Weather }>();
  return {
    async get(lat: number, lon: number): Promise<Weather> {
      const la = Number(lat.toFixed(2)), lo = Number(lon.toFixed(2)), key = `${la},${lo}`;
      const hit = cache.get(key);
      if (hit && now() - hit.at < ttlMs) return hit.value;
      const res = await fetchFn(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=weather_code,wind_speed_10m,is_day,temperature_2m`);
      if (!res.ok) throw new Error(`Weather service error ${res.status}`);
      const c = ((await res.json()) as OpenMeteo).current;
      const value: Weather = { kind: weatherKind(c.weather_code, c.wind_speed_10m), isDay: c.is_day === 1,
        temp: Math.round(c.temperature_2m), wind: Math.round(c.wind_speed_10m), code: c.weather_code };
      cache.set(key, { at: now(), value });
      return value;
    },
  };
}

export function weatherRouter(service: { get(lat: number, lon: number): Promise<Weather> }): Router {
  const r = Router();
  r.get("/", (req, res) => {
    const lat = Number(req.query.lat), lon = Number(req.query.lon);
    const bad = req.query.lat === undefined || req.query.lon === undefined || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180;
    if (bad) { res.status(400).json({ error: "lat and lon are required numbers" }); return; }
    service.get(lat, lon)
      .then(w => { res.json(w); })
      .catch(() => { res.status(502).json({ error: "Weather is unavailable right now" }); });
  });
  return r;
}
