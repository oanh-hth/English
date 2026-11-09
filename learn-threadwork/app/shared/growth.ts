// Exercise 1.2: Growth per importance and plant stages. Read curriculum/part-1/b-unions-and-records.md first.
import type { Importance } from "@app/shared/types";

/** Growth in percent for finishing a task of each importance. */
export const GROWTH: Record<Importance, number> = {
  // TODO 1.2: low 8, medium 15, high 25, critical 40
} as Record<Importance, number>;

export const FOCUS_GROWTH = 3;

export type StageName = "Seed" | "Sprout" | "Seedling" | "Young plant" | "Flowering" | "Fruiting" | "Ripening" | "Ready to harvest";

/** Each stage starts at this growth percent. */
export const STAGES: ReadonlyArray<readonly [number, StageName]> = [
  [0, "Seed"], [5, "Sprout"], [15, "Seedling"], [30, "Young plant"],
  [50, "Flowering"], [65, "Fruiting"], [80, "Ripening"], [100, "Ready to harvest"],
];

export function growthFor(importance: Importance): number {
  // TODO 1.2
  throw new Error("TODO 1.2");
}

/** The stage for a growth value. Values below 0 count as 0; values above 100 count as 100. */
export function stageOf(growth: number): StageName {
  // TODO 1.2
  throw new Error("TODO 1.2");
}

/** The next stage and how many percent are missing, or null when the plant is ready to harvest. */
export function nextStage(growth: number): { name: StageName; missing: number } | null {
  // TODO 1.2
  throw new Error("TODO 1.2");
}
