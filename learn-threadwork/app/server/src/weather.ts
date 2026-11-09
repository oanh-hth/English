// Exercise 8.5: Weather from Open-Meteo with a cache. Read curriculum/part-8/e-external-apis.md first.
import { Router } from "express";

export type WeatherKind = "sun" | "cloud" | "rain" | "snow" | "wind";
export interface Weather { kind: WeatherKind; isDay: boolean; temp: number; wind: number; code: number }

/**
 * WMO weather code + wind (km/h) -> scene:
 * snow for 71, 73, 75, 77, 85, 86; rain for 51-67, 80-82 and 95+; otherwise wind when wind >= 30;
 * otherwise cloud for code >= 2; otherwise sun.
 */
export function weatherKind(code: number, windKmh: number): WeatherKind {
  // TODO 8.5
  throw new Error("TODO 8.5");
}

export type FetchLike = (url: string) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

/**
 * get(lat, lon) calls
 *   https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=weather_code,wind_speed_10m,is_day,temperature_2m
 * (lat/lon rounded to 2 decimals) and returns a Weather (temp and wind rounded to whole numbers).
 * - Cache answers per rounded lat/lon for ttlMs (use `now()` so tests can control time).
 * - A response that is not ok throws new Error("Weather service error <status>").
 */
export function createWeatherService(fetchFn: FetchLike, ttlMs = 30 * 60_000, now: () => number = Date.now) {
  // TODO 8.5
  return { async get(lat: number, lon: number): Promise<Weather> { throw new Error("TODO 8.5"); } };
}

/**
 * GET /api/weather?lat=..&lon=..
 * 400 { error: "lat and lon are required numbers" } when missing, not numbers, or out of range (lat ±90, lon ±180);
 * 502 { error: "Weather is unavailable right now" } when the service throws; else 200 Weather.
 */
export function weatherRouter(service: { get(lat: number, lon: number): Promise<Weather> }): Router {
  // TODO 8.5
  return Router();
}
