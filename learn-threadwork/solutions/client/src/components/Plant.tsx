import type { PlantKind } from "@app/shared/types";
import { VARIETIES } from "@app/shared/garden";
import { stageOf } from "@app/shared/growth";

export interface PlantParts { seed: boolean; leaves: number; flowers: number; fruits: number; ripe: boolean }

export const MAX_FRUITS: Record<PlantKind, number> = { tomato: 5, chili: 6, lemon: 4, eggplant: 4 };

export function plantParts(growth: number, kind: PlantKind): PlantParts {
  const g = Math.min(100, Math.max(0, growth));
  const max = MAX_FRUITS[kind];
  const seed = g < 5;
  const fruits = g >= 65 ? Math.min(max, Math.floor((g - 65) / 7) + 1) : 0;
  const blooms = g >= 50 ? Math.min(max, Math.floor((g - 50) / 6) + 1) : 0;
  return { seed, leaves: seed ? 0 : Math.min(12, Math.floor(g / 8) + 2), flowers: Math.max(0, blooms - fruits), fruits, ripe: g >= 100 };
}

const FRUIT: Record<PlantKind, string> = { tomato: "#E0412F", chili: "#D42A1C", lemon: "#F2C230", eggplant: "#6B3FA0" };

export function Plant({ growth, kind }: { growth: number; kind: PlantKind }) {
  const p = plantParts(growth, kind);
  const g = Math.min(100, Math.max(0, growth));
  const top = 200 - (14 + g * 1.62);
  const label = `${VARIETIES[kind].name}, ${Math.round(g)}% grown, ${stageOf(g)}`;
  const along = (i: number, n: number) => 200 - ((i + 1) / (n + 1)) * (200 - top);
  return (
    <svg role="img" viewBox="0 0 200 260" aria-label={label} className="plant">
      {!p.seed && <path d={`M100 200 Q110 ${(200 + top) / 2} 100 ${top}`} stroke="#3E7D3A" strokeWidth={2 + g * 0.035} fill="none" />}
      {Array.from({ length: p.leaves }, (_, i) => {
        const y = along(i, p.leaves), side = i % 2 ? 1 : -1;
        // The position and tilt go on the <g>; the leaf itself has no transform, so CSS can animate it (7.8).
        return <g key={`l${i}`} transform={`translate(${100 + side * 12} ${y}) rotate(${side * -25})`}><ellipse data-part="leaf" rx={11} ry={5} fill="#4C9A43" /></g>;
      })}
      {Array.from({ length: p.flowers }, (_, i) => <circle key={`f${i}`} data-part="flower" cx={100 + (i % 2 ? 22 : -22)} cy={along(i + 2, 8)} r={4} fill="#F4C842" />)}
      {Array.from({ length: p.fruits }, (_, i) => (
        <circle key={`r${i}`} data-part="fruit" data-ripe={p.ripe ? "true" : undefined} cx={100 + (i % 2 ? 20 : -20)} cy={along(i, 6) + 12}
          r={4 + Math.min(1, (g - 65) / 35) * 7} fill={g >= 80 ? FRUIT[kind] : "#7DB548"} />
      ))}
      <path d="M56 212h88l-9 44H65z" fill="#C46B42" />
      <rect x={48} y={200} width={104} height={15} rx={4} fill="#D98157" />
      {p.seed && <ellipse data-part="seed" cx={100} cy={199} rx={6} ry={4} fill="#8A5A2B" />}
    </svg>
  );
}
