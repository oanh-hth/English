// Given: loads the weather for your saved place through the server (8.5) and the API client (9.1).
import { useEffect, useState } from "react";
import type { Api, WeatherReply } from "@app/client/src/api/client";

export interface Place { name: string; lat: number; lon: number }

export function useWeather(api: Api | null, place: Place | null) {
  const [weather, setWeather] = useState<WeatherReply | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!api || !place) { setWeather(null); return; }
    let live = true;
    const load = () => api.weather(place.lat, place.lon).then(w => { if (live) { setWeather(w); setError(""); } }).catch((e: Error) => live && setError(e.message));
    load();
    const id = setInterval(load, 30 * 60_000);
    return () => { live = false; clearInterval(id); };
  }, [api, place]);
  return { weather, error };
}
