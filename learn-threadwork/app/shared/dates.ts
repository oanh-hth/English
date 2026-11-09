// Exercise 2.1: Days, streaks and a thirsty plant. Read curriculum/part-2/a-pure-functions-and-dates.md first.
// Work with "YYYY-MM-DD" strings. Use UTC (Date.UTC / getUTC*) so time zones can't shift the day.
import type { Day, StreakState } from "@app/shared/types";

/** "2026-11-08" + 1 -> "2026-11-09". Works across months and years. n can be negative. */
export function addDays(day: Day, n: number): Day {
  // TODO 2.1
  throw new Error("TODO 2.1");
}

/** Whole days from a to b. daysBetween("2026-11-01", "2026-11-08") === 7. Negative if b is before a. */
export function daysBetween(a: Day, b: Day): number {
  // TODO 2.1
  throw new Error("TODO 2.1");
}

/**
 * Called when a task is finished on `today`.
 * - First task ever, or a gap of 2+ days: streak becomes 1.
 * - Last task was yesterday: streak + 1.
 * - Already finished one today: streak unchanged.
 */
export function updateStreak(state: StreakState, today: Day): StreakState {
  // TODO 2.1
  throw new Error("TODO 2.1");
}

/** The plant is thirsty when it has grown (growth >= 5) and no task was finished for more than 2 days. */
export function isThirsty(lastDone: Day | null, today: Day, growth: number): boolean {
  // TODO 2.1
  throw new Error("TODO 2.1");
}
