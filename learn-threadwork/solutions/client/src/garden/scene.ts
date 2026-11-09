export type WeatherKind = "sun" | "cloud" | "rain" | "snow" | "wind";
export type SkyPart = "sun" | "moon" | "stars" | "clouds" | "rain" | "snow" | "gusts";

export interface Scene { sky: "day" | "night"; parts: SkyPart[]; pollinators: boolean; watered: boolean; label: string }

export const WEATHER_LABEL: Record<WeatherKind, string> = { sun: "Sunny", cloud: "Cloudy", rain: "Rain", snow: "Snow", wind: "Windy" };

export function sceneFor(weather: WeatherKind | null, isDay: boolean | null, hour: number): Scene {
  const w = weather ?? "sun";
  const night = isDay === null ? hour >= 19 || hour < 6 : !isDay;
  const parts: SkyPart[] = [];
  if (night) parts.push("stars");
  if (w === "sun" || w === "wind") parts.push(night ? "moon" : "sun");
  else if (w === "snow" && night) parts.push("moon");
  if (w !== "sun") parts.push("clouds");
  if (w === "rain") parts.push("rain");
  if (w === "snow") parts.push("snow");
  if (w === "wind") parts.push("gusts");
  return { sky: night ? "night" : "day", parts, pollinators: !night && (w === "sun" || w === "cloud" || w === "wind"),
    watered: w === "rain", label: `${WEATHER_LABEL[w]} · ${night ? "Night" : "Day"}` };
}
