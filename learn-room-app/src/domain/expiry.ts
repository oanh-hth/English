import { daysLeft } from './dates';
import type { Item } from './types';

export type ExpiryStatus = 'none' | 'ok' | 'soon' | 'expired';

/**
 * 'none'    no expiry date
 * 'expired' the date has passed (daysLeft < 0)
 * 'soon'    expires today or within `windowDays` days
 * 'ok'      further away than that
 */
export function expiryStatus(item: Pick<Item, 'exp'>, today: Date, windowDays = 3): ExpiryStatus {
  // TODO: Get daysLeft first; null means 'none'. Then compare against 0 and windowDays.
  throw new Error('Not implemented yet');
}

/**
 * Human text for a number of days left:
 *   -3 -> 'Expired 3 days ago'   -1 -> 'Expired 1 day ago'
 *    0 -> 'Expires today'         1 -> 'Expires tomorrow'      5 -> 'Expires in 5 days'
 */
export function whenText(days: number): string {
  // TODO: Handle the special cases (negative, 0, 1) before the general one. Watch the singular "1
  //       day ago".
  throw new Error('Not implemented yet');
}

/**
 * Items that need the user's attention: still in the room (not `used`) and either
 * expired or expiring within `windowDays`. Sorted by days left, most urgent first.
 * Must not change the input array.
 */
export function needsAttention(items: readonly Item[], today: Date, windowDays = 3): Item[] {
  // TODO: Filter, then sort a COPY. Items with the same days left should keep their original order
  //       (Array.prototype.sort is stable).
  throw new Error('Not implemented yet');
}
