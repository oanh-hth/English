// PHASE 4 EXERCISE: implement the spaced-repetition scheduler (SM-2 style).
// Run: npm test   (from the learning/exercises folder). Make every test in srs.test.ts pass.
// Rules are in learning/phase-04-spaced-repetition.md.

export type Grade = 0 | 1 | 2 | 3; // 0 again, 1 hard, 2 good, 3 easy

export interface CardState {
  ease: number;   // multiplier, starts at 2.5, never below 1.3
  int: number;    // current interval in days (0 = in learning)
  reps: number;   // successful reviews in a row
  due: number;    // timestamp in ms when the card is next due
  lapses: number; // how many times you pressed Again
}

export const DAY = 86_400_000;
export const MINUTE = 60_000;

export function newCard(now: number): CardState {
  throw new Error('TODO: return a brand-new card that is due right now');
}

export function nextState(card: CardState, grade: Grade, now: number): CardState {
  throw new Error('TODO: apply the grading rules and return a NEW object (do not mutate)');
}

export function dueIds(cards: Record<string, CardState>, now: number): string[] {
  throw new Error('TODO: ids of cards with due <= now, oldest due first');
}

export function intervalLabel(card: CardState, grade: Grade): string {
  throw new Error('TODO: label shown on the rating button, e.g. "10 min", "3d", "2mo", "1.5y"');
}
