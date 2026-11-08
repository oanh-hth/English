// Live weather from Open-Meteo (free, no key): https://open-meteo.com
const FORECAST = "https://api.open-meteo.com/v1/forecast";
const GEOCODE = "https://geocoding-api.open-meteo.com/v1/search";

// WMO weather codes -> the scenes the garden can draw
export function kindOf(code, windKmh) {
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return "rain";
  if (windKmh >= 30) return "wind";
  if (code >= 2) return "cloud";
  return "sun";
}
const DESC = {
  0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Fog",
  51: "Drizzle", 53: "Drizzle", 55: "Drizzle", 56: "Freezing drizzle", 57: "Freezing drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain", 66: "Freezing rain", 67: "Freezing rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains", 80: "Showers", 81: "Showers", 82: "Heavy showers",
  85: "Snow showers", 86: "Snow showers", 95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm",
};

export function locate() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("This browser can't share your location."));
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: +p.coords.latitude.toFixed(3), lon: +p.coords.longitude.toFixed(3), name: "My location" }),
      e => reject(new Error(e.code === 1 ? "Location permission was declined. Search for your city instead." : "Couldn't get your location. Search for your city instead.")),
      { timeout: 12000, maximumAge: 30 * 60e3 });
  });
}

export async function searchCity(q) {
  const r = await fetch(`${GEOCODE}?name=${encodeURIComponent(q)}&count=6&language=en&format=json`);
  if (!r.ok) throw new Error("City search failed. Check your connection.");
  const d = await r.json();
  return (d.results || []).map(x => ({ name: [x.name, x.admin1, x.country].filter(Boolean).join(", "), lat: x.latitude, lon: x.longitude }));
}

export async function current(lat, lon) {
  const r = await fetch(`${FORECAST}?latitude=${lat}&longitude=${lon}&current=weather_code,wind_speed_10m,is_day,temperature_2m&timezone=auto`);
  if (!r.ok) throw new Error("Weather is unavailable right now.");
  const c = (await r.json()).current;
  return { kind: kindOf(c.weather_code, c.wind_speed_10m), desc: DESC[c.weather_code] || "", isDay: c.is_day === 1, temp: Math.round(c.temperature_2m), wind: Math.round(c.wind_speed_10m), at: Date.now() };
}
