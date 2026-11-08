import type { Item } from './types';

/**
 * Date helpers. The app works with whole days only, in the user's local time.
 * All functions are PURE: "today" is always passed in, never read from the clock inside.
 */

/** Parse 'YYYY-MM-DD' into a Date at local midnight. Throws on bad input (including 2026-02-31). */
export function parseISO(value: string): Date {
  // TODO: Use a regex to split the string, build new Date(y, m - 1, d), then check the Date did
  //       not "roll over" (day 31 of February becomes March). Throw Error(`Invalid date:
  //       ${value}`).
  throw new Error('Not implemented yet');
}

/** Format a Date as 'YYYY-MM-DD' using LOCAL year, month and day (not UTC!). */
export function toISO(date: Date): string {
  // TODO: Pad month and day to two digits. Careful: date.toISOString() uses UTC and would be wrong
  //       near midnight.
  throw new Error('Not implemented yet');
}

/** The same day at 00:00 local time. Must not change the input. */
export function startOfDay(date: Date): Date {
  // TODO: Return a NEW Date made from year, month and date only.
  throw new Error('Not implemented yet');
}

/** A new Date n days later (n can be negative). Must not mutate the input. */
export function addDays(date: Date, n: number): Date {
  // TODO: Copy the date first, then use setDate. This also handles month ends and leap years.
  throw new Error('Not implemented yet');
}

/** Whole calendar days from `from` to `to` (negative when `to` is earlier). Ignores the time of day. */
export function daysBetween(from: Date, to: Date): number {
  // TODO: Compare start-of-day timestamps and round (daylight saving makes some days 23 or 25
  //       hours long).
  throw new Error('Not implemented yet');
}

/** Days until the item expires: 0 = today, negative = already expired, null = no expiry date. */
export function daysLeft(item: Pick<Item, 'exp'>, today: Date): number | null {
  // TODO: An empty exp means "does not expire", so return null. Otherwise use parseISO and
  //       daysBetween.
  throw new Error('Not implemented yet');
}
