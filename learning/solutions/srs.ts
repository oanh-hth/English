// REFERENCE SOLUTION for Part 4. Try on your own first.
export type Grade = 0 | 1 | 2 | 3;
export interface CardState { ease: number; int: number; reps: number; due: number; lapses: number }
export const DAY = 86_400_000;
export const MINUTE = 60_000;

export const newCard = (now: number): CardState => ({ ease: 2.5, int: 0, reps: 0, due: now, lapses: 0 });

export function nextState(c: CardState, grade: Grade, now: number): CardState {
  const n = { ...c };
  if (grade === 0) {
    return { ...n, lapses: c.lapses + 1, reps: 0, ease: Math.max(1.3, c.ease - 0.2), int: 0, due: now + 10 * MINUTE };
  }
  let days: number;
  if (grade === 1) {
    days = Math.max(1, Math.round((c.int || 1) * 1.2));
    n.ease = Math.max(1.3, c.ease - 0.15);
  } else if (grade === 2) {
    days = c.reps === 0 ? 1 : c.reps === 1 ? 3 : Math.round(c.int * c.ease);
  } else {
    days = c.reps === 0 ? 4 : c.reps === 1 ? 7 : Math.round(c.int * c.ease * 1.3);
    n.ease = c.ease + 0.15;
  }
  n.reps = c.reps + 1;
  n.int = Math.max(1, days);
  n.due = now + n.int * DAY;
  return n;
}

export const dueIds = (cards: Record<string, CardState>, now: number): string[] =>
  Object.keys(cards).filter(id => cards[id]!.due <= now).sort((a, b) => cards[a]!.due - cards[b]!.due);

export function intervalLabel(c: CardState, grade: Grade): string {
  if (grade === 0) return '10 min';
  const d = nextState(c, grade, 0).int;
  return d < 30 ? `${d}d` : d < 365 ? `${Math.round(d / 30)}mo` : `${(d / 365).toFixed(1)}y`;
}
