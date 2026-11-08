import type { Item } from './types';

/**
 * Date helpers. The app works with whole days only, in the user's local time.
 * All functions are PURE: "today" is always passed in, never read from the clock inside.
 */

/** Parse 'YYYY-MM-DD' into a Date at local midnight. Throws on bad input (including 2026-02-31). */
export function parseISO(value: string): Date {
  // @solution-start Use a regex to split the string, build new Date(y, m - 1, d), then check the Date did not "roll over" (day 31 of February becomes March). Throw Error(`Invalid date: ${value}`).
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) throw new Error(`Invalid date: ${value}`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
  // @solution-end
}

/** Format a Date as 'YYYY-MM-DD' using LOCAL year, month and day (not UTC!). */
export function toISO(date: Date): string {
  // @solution-start Pad month and day to two digits. Careful: date.toISOString() uses UTC and would be wrong near midnight.
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  // @solution-end
}

/** The same day at 00:00 local time. Must not change the input. */
export function startOfDay(date: Date): Date {
  // @solution-start Return a NEW Date made from year, month and date only.
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // @solution-end
}

/** A new Date n days later (n can be negative). Must not mutate the input. */
export function addDays(date: Date, n: number): Date {
  // @solution-start Copy the date first, then use setDate. This also handles month ends and leap years.
  const copy = new Date(date);
  copy.setDate(copy.getDate() + n);
  return copy;
  // @solution-end
}

/** Whole calendar days from `from` to `to` (negative when `to` is earlier). Ignores the time of day. */
export function daysBetween(from: Date, to: Date): number {
  // @solution-start Compare start-of-day timestamps and round (daylight saving makes some days 23 or 25 hours long).
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000);
  // @solution-end
}

/** Days until the item expires: 0 = today, negative = already expired, null = no expiry date. */
export function daysLeft(item: Pick<Item, 'exp'>, today: Date): number | null {
  // @solution-start An empty exp means "does not expire", so return null. Otherwise use parseISO and daysBetween.
  if (!item.exp) return null;
  return daysBetween(today, parseISO(item.exp));
  // @solution-end
}
