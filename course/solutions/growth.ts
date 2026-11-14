export type PlantType = 'tomato' | 'chilli' | 'strawberry' | 'sunflower' | 'pumpkin' | 'sugarcane' | 'bamboo';
export const NEED: Record<PlantType, number> = { tomato: 600, chilli: 450, strawberry: 500, sunflower: 750, pumpkin: 900, sugarcane: 1100, bamboo: 1300 };
export const STAGES = ['Seed', 'Sprout', 'Seedling', 'Growing', 'Budding', 'Ready to harvest'] as const;

/** Where is the plant? t is 0..1, index picks the stage name. */
export function stageOf(growth: number, need: number): { t: number; index: number; label: string } {
  const t = Math.max(0, Math.min(1, growth / need));
  const index = t >= 1 ? 5 : t < 0.08 ? 0 : t < 0.25 ? 1 : t < 0.5 ? 2 : t < 0.75 ? 3 : 4;
  return { t, index, label: STAGES[index]! };
}

export type Garden = { growth: number | null; bank: number }; // growth is null when no plant is growing

/** Add points. With no plant, or past ripe, the extra goes to the bank for the next seed. */
export function addPoints(g: Garden, points: number, need: number): { garden: Garden; becameRipe: boolean } {
  if (points <= 0) return { garden: g, becameRipe: false };
  if (g.growth === null) return { garden: { growth: null, bank: g.bank + points }, becameRipe: false };
  const total = g.growth + points, growth = Math.min(need, total);
  return { garden: { growth, bank: g.bank + Math.max(0, total - need) }, becameRipe: g.growth < need && growth >= need };
}

/** Planting: the bank pours into the new plant (which may even ripen at once). */
export function plantSeed(bank: number, need: number): Garden {
  const growth = Math.min(need, bank);
  return { growth, bank: Math.max(0, bank - need) };
}

const num = (d: string) => { const [y, m, dd] = d.split('-').map(Number) as [number, number, number]; return Math.round(Date.UTC(y, m - 1, dd) / 864e5); };

/** A plant is thirsty after 3 days without any studying. It never dies. */
export const isThirsty = (lastWatered: string | null, today: string): boolean => lastWatered === null || num(today) - num(lastWatered) >= 3;

/** The last 7 days, oldest first, true when that day was watered. */
export function weekStrip(wateredDays: string[], today: string): boolean[] {
  const set = new Set(wateredDays.map(num));
  return Array.from({ length: 7 }, (_, i) => set.has(num(today) - (6 - i)));
}
