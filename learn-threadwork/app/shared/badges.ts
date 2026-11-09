// Exercise 2.4: Badges from your history. Read curriculum/part-2/c-rewards.md first.
import type { GardenState, StreakState, Task } from "@app/shared/types";

export interface Stats {
  finished: number;            // tasks with status "done"
  finishedCritical: number;    // done tasks with importance "critical"
  linkPairs: number;           // each link counted once (a<->b is one pair)
  resourcesUsed: number;       // resources marked used, across all tasks
  harvests: number;
  streak: number;
  focusSessions: number;
}

export interface Badge { id: string; name: string; description: string; earned: (s: Stats) => boolean }

export const BADGES: Badge[] = [
  { id: "first-sprout", name: "First sprout", description: "Finish your first task", earned: s => s.finished >= 1 },
  { id: "weaver", name: "Weaver", description: "Link 3 pairs of tasks", earned: s => s.linkPairs >= 3 },
  { id: "first-harvest", name: "First harvest", description: "Harvest your first plant", earned: s => s.harvests >= 1 },
  { id: "green-thumb", name: "Green thumb", description: "Harvest 3 plants", earned: s => s.harvests >= 3 },
  { id: "on-a-roll", name: "On a roll", description: "Keep a 3-day streak", earned: s => s.streak >= 3 },
  { id: "big-push", name: "Big push", description: "Finish a Critical task", earned: s => s.finishedCritical >= 1 },
  { id: "well-equipped", name: "Well equipped", description: "Tick 5 resources as used", earned: s => s.resourcesUsed >= 5 },
  { id: "focused", name: "Focused", description: "Complete 5 focus sessions", earned: s => s.focusSessions >= 5 },
];

export function computeStats(tasks: readonly Task[], garden: GardenState, streak: StreakState, focusSessions: number): Stats {
  // TODO 2.4
  throw new Error("TODO 2.4");
}

/** Ids of earned badges, in BADGES order. */
export function earnedBadges(stats: Stats): string[] {
  // TODO 2.4
  throw new Error("TODO 2.4");
}

/** Badges earned in `after` that were not earned in `before` (to celebrate new ones). */
export function newBadges(before: Stats, after: Stats): string[] {
  // TODO 2.4
  throw new Error("TODO 2.4");
}
