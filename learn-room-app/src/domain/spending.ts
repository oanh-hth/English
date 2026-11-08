import type { Item } from './types';

/** '2026-11-08' -> '2026-11' */
export function monthKey(isoDate: string): string {
  // TODO: The first 7 characters.
  throw new Error('Not implemented yet');
}

/**
 * Format a number as Vietnamese dong, e.g. 517600 -> '517.600 ₫' (a no-break space before the symbol).
 * Use Intl.NumberFormat with the 'vi-VN' locale; no decimals.
 */
export function formatVND(amount: number): string {
  // TODO: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND',
  //       maximumFractionDigits: 0 }). Round the amount first.
  throw new Error('Not implemented yet');
}

/** Sum of `price` for items bought in the given month (month0: 0 = January). Used-up items still count. */
export function totalForMonth(items: readonly Item[], year: number, month0: number, upToDay = 31): number {
  // TODO: Build the 'YYYY-MM' key, keep items whose monthKey matches and whose day-of-month is <=
  //       upToDay, then reduce.
  throw new Error('Not implemented yet');
}

export interface SpendingComparison {
  /** This month, up to and including today. */
  current: number;
  /** Last month, over the same number of days (day 1 to today's day-of-month). */
  previousSameDays: number;
  /** Last month in full. */
  previousTotal: number;
  /** (current - previousSameDays) / previousSameDays * 100, or null when previousSameDays is 0. */
  changePct: number | null;
  trend: 'up' | 'down' | 'flat';
}

/**
 * Compare this month so far with the same days of last month.
 * January's previous month is December of the previous year.
 * If today is the 31st and last month only has 30 days, "the same days" means the whole of last month.
 */
export function compareSpending(items: readonly Item[], today: Date): SpendingComparison {
  // TODO: Work out last month's year and month, use totalForMonth three times (current up to
  //       today, previous up to min(today's day, days in previous month), previous in full), then
  //       derive changePct and trend.
  throw new Error('Not implemented yet');
}
