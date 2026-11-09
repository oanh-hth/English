// Given: the Settings page: weather location, sync, backup and sign-out.
import { useState } from "react";
import { useApp } from "@app/client/src/state/AppContext";
import { useLocalStorage } from "@app/client/src/hooks/useLocalStorage";
import type { Place } from "@app/client/src/hooks/useWeather";
import { useShell } from "@app/client/src/views/shared";

export function SettingsView({ onSignOut, syncText }: { onSignOut: () => void; syncText: string }) {
  const { state } = useApp();
  const { weather, api } = useShell();
  const [place, setPlace] = useLocalStorage<Place | null>("threadwork.place", null);
  const [msg, setMsg] = useState("");
  const locate = () => {
    setMsg("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      p => { setPlace({ name: "My location", lat: +p.coords.latitude.toFixed(2), lon: +p.coords.longitude.toFixed(2) }); setMsg(""); },
      () => setMsg("Location permission was declined."), { timeout: 12000 });
  };
  const backup = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: "threadwork", exportedAt: new Date().toISOString(), state })], { type: "application/json" }));
    a.download = `threadwork-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  return (
    <div className="grid-2">
      <section className="card"><h1>Settings</h1>
        <h2>Weather for your garden</h2>
        {!api && <p className="muted">Weather needs the server. Sign in to use it.</p>}
        <p>{place ? `Location: ${place.name} (${place.lat}, ${place.lon})` : "No location yet. The garden shows sunny weather and uses your clock for day and night."}</p>
        {weather && <p>Now: {weather.kind}, {weather.temp}°, wind {weather.wind} km/h, {weather.isDay ? "day" : "night"}</p>}
        <div className="row"><button onClick={locate}>Use my location</button>{place && <button onClick={() => setPlace(null)}>Remove location</button>}</div>
        {msg && <p className="muted">{msg}</p>}
      </section>
      <section className="card"><h2>Your data</h2>
        <p>{syncText}</p>
        <button onClick={backup}>Download a backup</button>
        <h2>Account</h2>
        <button onClick={onSignOut}>Sign out</button>
      </section>
    </div>
  );
}
