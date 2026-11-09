// Given: the sky around the plant. It draws what your sceneFor (7.7) decides. The CSS is in styles.css.
import type { ReactNode } from "react";
import { sceneFor, type WeatherKind } from "@app/client/src/garden/scene";

const seeded = (i: number, n: number) => { const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453; return x - Math.floor(x); };

export function Sky({ weather, isDay, children, small }: { weather: WeatherKind | null; isDay: boolean | null; children: ReactNode; small?: boolean }) {
  let scene;
  try { scene = sceneFor(weather, isDay, new Date().getHours()); } catch { return <div className="sky day">{children}</div>; }
  const has = (p: string) => scene.parts.includes(p as never);
  const many = (n: number, cls: string, style: (i: number) => object) => Array.from({ length: small ? Math.ceil(n / 3) : n }, (_, i) => <i key={i} className={cls} style={style(i)} />);
  return (
    <div className={`sky ${scene.sky}${small ? " small" : ""}`} data-pollinators={scene.pollinators}>
      {!small && <span className="sky-label">{scene.label}</span>}
      {has("stars") && many(14, "star", i => ({ left: `${seeded(i, 1) * 95}%`, top: `${seeded(i, 2) * 45}%`, animationDelay: `${-seeded(i, 3) * 3}s` }))}
      {has("sun") && <i className="sun" />}
      {has("moon") && <i className="moon" />}
      {has("clouds") && many(3, "cloud", i => ({ top: `${8 + i * 10}%`, animationDelay: `${-(i * 13 + seeded(i, 5) * 10)}s` }))}
      <div className="sky-plant">{children}</div>
      {has("rain") && many(40, "rain", i => ({ left: `${seeded(i, 6) * 100}%`, animationDelay: `${-seeded(i, 7)}s` }))}
      {has("snow") && many(26, "flake", i => ({ left: `${seeded(i, 11) * 100}%`, animationDelay: `${-seeded(i, 12) * 7}s` }))}
      {has("gusts") && many(6, "gust", i => ({ top: `${15 + seeded(i, 14) * 60}%`, animationDelay: `${-seeded(i, 15) * 1.6}s` }))}
    </div>
  );
}
