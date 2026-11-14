// Exercise 2.1: Days, weeks and due labels. Read curriculum/part-2/a-pure-functions-and-dates.md first.
// Work with "YYYY-MM-DD" strings. Use UTC (Date.UTC / getUTC*) so time zones can't shift the day.
import type { Day } from "@app/shared/types";

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

/** The Monday of the week `day` is in (weeks start on Monday). */
export function startOfWeek(day: Day): Day {
  // TODO 2.1: hint: new Date(ms).getUTCDay() is 0 for Sunday, 1 for Monday … 6 for Saturday
  throw new Error("TODO 2.1");
}

/** A short label for a due day, seen from `today`: "Due today", "Due tomorrow", "Due in 3d", "2d overdue". "" for null. */
export function dueLabel(due: Day | null, today: Day): string {
  // TODO 2.1
  throw new Error("TODO 2.1");
}
