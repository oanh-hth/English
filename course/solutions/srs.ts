export const INTERVALS = [1, 3, 7, 14, 30, 60, 120] as const;
export const MAX_STAGE = INTERVALS.length - 1;

export type Day = string; // 'YYYY-MM-DD'
export type Grade = 0 | 1 | 2 | 3; // again, hard, good, easy
export type Note = { id: number; stage: number; due: Day; lapses: number; reps: number; last: Day | null };

const pad = (n: number) => String(n).padStart(2, '0');
// Work in whole days since 1970 using UTC, so daylight saving can never shift a date.
export const dayNum = (d: Day): number => { const [y, m, dd] = d.split('-').map(Number) as [number, number, number]; return Math.round(Date.UTC(y, m - 1, dd) / 864e5); };
const fromNum = (n: number): Day => { const d = new Date(n * 864e5); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
export const addDays = (d: Day, n: number): Day => fromNum(dayNum(d) + n);
export const diffDays = (a: Day, b: Day): number => dayNum(a) - dayNum(b);

/** First day on or after `target` with fewer than `cap` notes due. `except` is the note being moved. */
export function place(notes: Note[], target: Day, cap: number, except?: Note): Day {
  const load = new Map<Day, number>();
  for (const n of notes) if (n !== except) load.set(n.due, (load.get(n.due) ?? 0) + 1);
  let n = dayNum(target);
  while ((load.get(fromNum(n)) ?? 0) >= Math.max(1, cap)) n++;
  return fromNum(n);
}

/** A brand new note: stage 0, first review tomorrow or the next day with room. */
export function schedule(notes: Note[], note: Note, today: Day, cap: number): Note {
  note.stage = 0; note.lapses = 0; note.reps = 0; note.last = null;
  note.due = place(notes, addDays(today, INTERVALS[0]), cap, note);
  return note;
}

/** Grade a review. Returns the number of days until the next one. */
export function review(notes: Note[], note: Note, grade: Grade, today: Day, cap: number): number {
  let days: number;
  if (grade === 0) { note.stage = 0; note.lapses += 1; days = 1; }
  else if (grade === 1) days = Math.max(1, Math.round(INTERVALS[note.stage]! * 0.7));
  else { note.stage = Math.min(MAX_STAGE, note.stage + (grade === 3 ? 2 : 1)); days = INTERVALS[note.stage]!; }
  note.reps += 1; note.last = today;
  note.due = place(notes, addDays(today, days), cap, note);
  return diffDays(note.due, today);
}

/** A wrong answer elsewhere: bring a far-off note back to tomorrow (or the next free day). */
export function slip(notes: Note[], note: Note, today: Day, cap: number): void {
  if (diffDays(note.due, today) <= 1) return;
  note.stage = Math.max(0, note.stage - 1);
  note.due = place(notes, addDays(today, 1), cap, note);
}

/** Due today or overdue, oldest first, then the weakest first. */
export const dueNotes = (notes: Note[], today: Day): Note[] =>
  notes.filter(n => diffDays(n.due, today) <= 0).sort((a, b) => dayNum(a.due) - dayNum(b.due) || a.stage - b.stage);

/** Notes due after today, within `span` days, grouped by day, soonest first. */
export function upcoming(notes: Note[], today: Day, span = 14): { day: Day; notes: Note[] }[] {
  const map = new Map<Day, Note[]>();
  for (const n of notes) { const d = diffDays(n.due, today); if (d > 0 && d <= span) map.set(n.due, [...(map.get(n.due) ?? []), n]); }
  return [...map.entries()].sort((a, b) => dayNum(a[0]) - dayNum(b[0])).map(([day, list]) => ({ day, notes: list }));
}
