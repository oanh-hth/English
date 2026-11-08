import type { Day, StreakState } from "@app/shared/types";

const toUtc = (day: Day) => {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!);
};
const fromUtc = (ms: number): Day => new Date(ms).toISOString().slice(0, 10);

export function addDays(day: Day, n: number): Day {
  return fromUtc(toUtc(day) + n * 86_400_000);
}

export function daysBetween(a: Day, b: Day): number {
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

export function updateStreak(state: StreakState, today: Day): StreakState {
  if (state.lastDone === today) return state;
  const streak = state.lastDone && daysBetween(state.lastDone, today) === 1 ? state.streak + 1 : 1;
  return { streak, lastDone: today };
}

export function isThirsty(lastDone: Day | null, today: Day, growth: number): boolean {
  return growth >= 5 && lastDone !== null && daysBetween(lastDone, today) > 2;
}
