import type { Day } from "@app/shared/types";

const toUtc = (day: Day) => { const [y, m, d] = day.split("-").map(Number); return Date.UTC(y!, m! - 1, d!); };
const fromUtc = (ms: number): Day => new Date(ms).toISOString().slice(0, 10);

export function addDays(day: Day, n: number): Day {
  return fromUtc(toUtc(day) + n * 86_400_000);
}

export function daysBetween(a: Day, b: Day): number {
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

export function startOfWeek(day: Day): Day {
  const weekday = new Date(toUtc(day)).getUTCDay();          // 0 Sunday … 6 Saturday
  return addDays(day, -((weekday + 6) % 7));
}

export function dueLabel(due: Day | null, today: Day): string {
  if (!due) return "";
  const d = daysBetween(today, due);
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return d < 0 ? `${-d}d overdue` : `Due in ${d}d`;
}
