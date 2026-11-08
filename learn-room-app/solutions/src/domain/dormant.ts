import { daysBetween, daysLeft, parseISO } from './dates';
import type { CategoryId, Item } from './types';

/**
 * "Dormant" items are things nobody has touched for a long time. The dog (Misu) reminds you about them.
 */
export const DORMANT_DAYS = 30;
export const DORMANT_DAYS_LONG = 90;
/** Slow-moving categories get 90 days instead of 30. */
export const LONG_IDLE: ReadonlySet<CategoryId> = new Set<CategoryId>(['clothes', 'yarn', 'tools', 'stationery']);

/** Days since the item was last touched: the `touched` date when there is one, otherwise `bought`. */
export function idleDays(item: Item, today: Date): number {
  // @solution-start daysBetween(parseISO(...), today).
  return daysBetween(parseISO(item.touched ?? item.bought), today);
  // @solution-end
}

/** 90 for LONG_IDLE categories, 30 for everything else. */
export function dormantAfter(item: Pick<Item, 'cat'>): number {
  // @solution-start One line with a Set lookup.
  return LONG_IDLE.has(item.cat) ? DORMANT_DAYS_LONG : DORMANT_DAYS;
  // @solution-end
}

/** Still in date: has an expiry date that is today or later. */
function inDate(item: Item, today: Date): boolean {
  const d = daysLeft(item, today);
  return d !== null && d >= 0;
}

/** The user answered "not used yet" less than (or exactly) 30 days ago. */
function snoozeActive(item: Item, today: Date): boolean {
  return !!item.snoozed && daysBetween(parseISO(item.snoozed), today) <= DORMANT_DAYS;
}

/**
 * Dormant when ALL of these hold:
 *  - still in the room (not used) and not a gift;
 *  - idleDays is MORE than dormantAfter(item);
 *  - NOT (still in date AND the question is snoozed): a snoozed in-date item is left alone for 30 days.
 */
export function isDormant(item: Item, today: Date): boolean {
  // @solution-start Use the two helpers above (inDate and snoozeActive).
  if (item.used || item.cat === 'gift') return false;
  if (idleDays(item, today) <= dormantAfter(item)) return false;
  return !(inDate(item, today) && snoozeActive(item, today));
  // @solution-end
}

/** Dormant AND still in date: the dog only ASKS "have you used it yet?" instead of nagging. */
export function needsAsk(item: Item, today: Date): boolean {
  // @solution-start Compose the functions you already have.
  return isDormant(item, today) && inDate(item, today);
  // @solution-end
}

/** All dormant items, the longest idle first. Must not change the input. */
export function dormantList(items: readonly Item[], today: Date): Item[] {
  // @solution-start filter + sort on a copy.
  return items.filter((i) => isDormant(i, today)).sort((a, b) => idleDays(b, today) - idleDays(a, today));
  // @solution-end
}
