import type { Importance } from "@app/shared/types";

export const GROWTH: Record<Importance, number> = { low: 8, medium: 15, high: 25, critical: 40 };
export const FOCUS_GROWTH = 3;

export type StageName = "Seed" | "Sprout" | "Seedling" | "Young plant" | "Flowering" | "Fruiting" | "Ripening" | "Ready to harvest";

export const STAGES: ReadonlyArray<readonly [number, StageName]> = [
  [0, "Seed"], [5, "Sprout"], [15, "Seedling"], [30, "Young plant"],
  [50, "Flowering"], [65, "Fruiting"], [80, "Ripening"], [100, "Ready to harvest"],
];

export function growthFor(importance: Importance): number {
  return GROWTH[importance];
}

const clamp = (g: number) => Math.min(100, Math.max(0, g));

export function stageOf(growth: number): StageName {
  const g = clamp(growth);
  let name: StageName = "Seed";
  for (const [at, stage] of STAGES) if (g >= at) name = stage;
  return name;
}

export function nextStage(growth: number): { name: StageName; missing: number } | null {
  const g = clamp(growth);
  const next = STAGES.find(([at]) => at > g);
  return next ? { name: next[1], missing: next[0] - g } : null;
}
