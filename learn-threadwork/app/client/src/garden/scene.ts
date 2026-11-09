// Exercise 7.7: The sky around the plant. Read curriculum/part-7/d-weather-and-motion.md first.
export type WeatherKind = "sun" | "cloud" | "rain" | "snow" | "wind";
export type SkyPart = "sun" | "moon" | "stars" | "clouds" | "rain" | "snow" | "gusts";

export interface Scene {
  sky: "day" | "night";
  parts: SkyPart[];          // in the order listed below
  pollinators: boolean;      // bees and butterflies come out
  watered: boolean;          // rain waters the plant (it can't be thirsty)
  label: string;             // e.g. "Rain · Night"
}

export const WEATHER_LABEL: Record<WeatherKind, string> = { sun: "Sunny", cloud: "Cloudy", rain: "Rain", snow: "Snow", wind: "Windy" };

/**
 * - weather null (unknown) counts as "sun". night: isDay === false; when isDay is null, night from 19:00 to 05:59.
 * - parts, in this order: "stars" at night; "sun" (day) or "moon" (night) for sun and wind, and the moon also at a
 *   snowy night; "clouds" unless sunny; then "rain", "snow" or "gusts" for those weathers.
 * - pollinators only on dry days: daytime and weather sun, cloud or wind.
 * - watered when it rains. label: "<WEATHER_LABEL> · Day|Night".
 */
export function sceneFor(weather: WeatherKind | null, isDay: boolean | null, hour: number): Scene {
  // TODO 7.7
  throw new Error("TODO 7.7");
}
