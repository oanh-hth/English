// Part 5 exercises 5.11 to 5.17. Make `npm test` pass for test/srs.test.ts.
export const INTERVALS = [1, 3, 7, 14, 30, 60, 120] as const;
export const MAX_STAGE = INTERVALS.length - 1;

export type Day = string; // 'YYYY-MM-DD'
export type Grade = 0 | 1 | 2 | 3; // again, hard, good, easy
export type Note = { id: number; stage: number; due: Day; lapses: number; reps: number; last: Day | null };

/** Add n days to a date string. Use UTC arithmetic so daylight saving cannot move the result. */
export const addDays = (d: Day, n: number): Day => { throw new Error('TODO 5.11'); };

/** a minus b, in whole days. */
export const diffDays = (a: Day, b: Day): number => { throw new Error('TODO 5.11'); };

/** First day on or after `target` that has fewer than `cap` notes due. Ignore `except` (the note being moved) when counting. */
export function place(notes: Note[], target: Day, cap: number, except?: Note): Day { throw new Error('TODO 5.12'); }

/** A brand new note: stage 0, no lapses or reps, due tomorrow or the next day with room. Returns the same note. */
export function schedule(notes: Note[], note: Note, today: Day, cap: number): Note { throw new Error('TODO 5.13'); }

/** Grade a review (see app-spec.md for the table). Updates the note and returns the days until its next review. */
export function review(notes: Note[], note: Note, grade: Grade, today: Day, cap: number): number { throw new Error('TODO 5.14'); }

/** A wrong answer elsewhere: if the note is more than a day away, drop one stage and bring it to tomorrow (or the next free day). */
export function slip(notes: Note[], note: Note, today: Day, cap: number): void { throw new Error('TODO 5.15'); }

/** Due today or overdue. Oldest due date first, then lowest stage first. */
export const dueNotes = (notes: Note[], today: Day): Note[] => { throw new Error('TODO 5.16'); };

/** Notes due after today and within `span` days, grouped by day, soonest first. */
export function upcoming(notes: Note[], today: Day, span = 14): { day: Day; notes: Note[] }[] { throw new Error('TODO 5.17'); }
