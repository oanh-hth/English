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
  const done = tasks.filter(t => t.status === "done");
  return {
    finished: done.length,
    finishedCritical: done.filter(t => t.importance === "critical").length,
    linkPairs: tasks.reduce((n, t) => n + t.links.length, 0) / 2,
    resourcesUsed: tasks.reduce((n, t) => n + t.resources.filter(r => r.used).length, 0),
    harvests: garden.harvests.length,
    streak: streak.streak,
    focusSessions,
  };
}

export function earnedBadges(stats: Stats): string[] {
  return BADGES.filter(b => b.earned(stats)).map(b => b.id);
}

export function newBadges(before: Stats, after: Stats): string[] {
  const had = new Set(earnedBadges(before));
  return earnedBadges(after).filter(id => !had.has(id));
}
