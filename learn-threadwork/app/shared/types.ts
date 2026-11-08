// The Threadwork domain model. This file is given: read it in Phase 1, don't change it.

export const IMPORTANCE = ["low", "medium", "high", "critical"] as const;
export type Importance = (typeof IMPORTANCE)[number];

export const STATUSES = ["inbox", "doing", "done"] as const;
export type Status = (typeof STATUSES)[number];

/** A calendar day as "YYYY-MM-DD". Strings compare correctly with < and >. */
export type Day = string;

export interface ResourceUse {
  resourceId: string;
  used: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: Status;
  importance: Importance;
  due: Day | null;
  details: string;
  links: string[];          // ids of related tasks (links go both ways)
  resources: ResourceUse[];
  createdAt: Day;
  doneAt: Day | null;
}

export type PlantKind = "tomato" | "chili" | "lemon" | "eggplant";

export interface Harvest {
  kind: PlantKind;
  fruits: number;
  day: Day;
}

export interface GardenState {
  kind: PlantKind;          // what is growing now
  growth: number;           // 0..100
  extra: number;            // growth beyond 100, carried into the next plant
  nextKind: PlantKind;      // what to plant after the next harvest
  harvests: Harvest[];
}

export interface StreakState {
  streak: number;
  lastDone: Day | null;
}

/** Either a value or an error message. Used instead of throwing for expected failures. */
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
