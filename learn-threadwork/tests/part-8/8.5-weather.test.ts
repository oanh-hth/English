import express from "express";
import request from "supertest";
import { weatherKind, createWeatherService, weatherRouter, type FetchLike } from "@app/server/src/weather";

const reply = (current: object, ok = true, status = 200): ReturnType<FetchLike> => Promise.resolve({ ok, status, json: () => Promise.resolve({ current }) });
const rainy = { weather_code: 63, wind_speed_10m: 12.4, is_day: 1, temperature_2m: 27.6 };

describe("8.5 weatherKind", () => {
  it.each([
    [0, 5, "sun"], [1, 5, "sun"], [2, 5, "cloud"], [45, 5, "cloud"], [61, 5, "rain"], [81, 50, "rain"],
    [95, 5, "rain"], [73, 5, "snow"], [86, 40, "snow"], [0, 30, "wind"], [3, 45, "wind"],
  ] as const)("code %i wind %i -> %s", (code, wind, kind) => expect(weatherKind(code, wind)).toBe(kind));
});

describe("8.5 createWeatherService", () => {
  it("calls Open-Meteo and maps the answer", async () => {
    const fetchFn = vi.fn<FetchLike>(() => reply(rainy));
    const w = await createWeatherService(fetchFn).get(10.8231, 106.6297);
    expect(w).toEqual({ kind: "rain", isDay: true, temp: 28, wind: 12, code: 63 });
    expect(fetchFn.mock.calls[0]![0]).toBe("https://api.open-meteo.com/v1/forecast?latitude=10.82&longitude=106.63&current=weather_code,wind_speed_10m,is_day,temperature_2m");
  });
  it("caches per place until the time is up", async () => {
    let t = 0;
    const fetchFn = vi.fn<FetchLike>(() => reply(rainy));
    const s = createWeatherService(fetchFn, 1000, () => t);
    await s.get(10.821, 106.631); await s.get(10.822, 106.629);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    await s.get(21.03, 105.85);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    t = 1000; await s.get(10.82, 106.63);
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });
  it("throws on a bad response", async () => {
    await expect(createWeatherService(() => reply({}, false, 503)).get(1, 1)).rejects.toThrow("Weather service error 503");
  });
});

describe("8.5 /api/weather", () => {
  const app = (get: (lat: number, lon: number) => Promise<never> | Promise<object>) => {
    const a = express(); a.use("/api/weather", weatherRouter({ get } as never)); return a;
  };
  it("returns the weather", async () => {
    const res = await request(app(() => Promise.resolve({ kind: "sun" }))).get("/api/weather?lat=10.8&lon=106.6");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ kind: "sun" });
  });
  it.each(["", "?lat=10", "?lat=abc&lon=1", "?lat=91&lon=0", "?lat=0&lon=-181"])("rejects %s", async q => {
    const res = await request(app(() => Promise.resolve({}))).get(`/api/weather${q}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "lat and lon are required numbers" });
  });
  it("answers 502 when the service fails", async () => {
    const res = await request(app(() => Promise.reject(new Error("down")))).get("/api/weather?lat=1&lon=1");
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: "Weather is unavailable right now" });
  });
});
