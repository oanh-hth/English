import { monthKey } from './spending';
import { sameProduct } from './names';
import type { CategoryId, Item } from './types';

/**
 * The "rebuy rule": when you buy something again, last month's one is probably finished,
 * so it should leave the room (but its price stays in your spending history).
 */

/** Categories where ONE at a time is normal: a new pack of diapers replaces the old one, whatever the brand. */
export const REBUY_CATS: ReadonlySet<CategoryId> = new Set<CategoryId>(['baby', 'cleaning']);

/**
 * Should `newer` retire `older`? All of these must hold:
 *  - they are different items and `older` is still in the room (not used);
 *  - neither is in the 'gift' category;
 *  - `older` was bought in an EARLIER month than `newer` (compare monthKey strings);
 *  - same product (sameProduct on the names) OR same category that is in REBUY_CATS.
 */
export function isRebuy(older: Item, newer: Item): boolean {
  // @solution-start Early-return false for each failing condition; the last line combines the two "same thing" tests.
  if (older.id === newer.id || older.used) return false;
  if (older.cat === 'gift' || newer.cat === 'gift') return false;
  if (!(monthKey(older.bought) < monthKey(newer.bought))) return false;
  return sameProduct(older.name, newer.name) || (older.cat === newer.cat && REBUY_CATS.has(older.cat));
  // @solution-end
}

export interface RebuyResult {
  items: Item[];
  replaced: { older: Item; newer: Item }[];
}

/**
 * `items` is the complete list (it already contains the `added` ones). For every added item that is not
 * itself `used`, find the older items it replaces and return them as COPIES with
 * `used: true` and `replacedBy: <newer id>`. Each older item is replaced at most once.
 * Nothing is mutated. With { enabled: false } return the same items and no replacements.
 */
export function applyRebuy(
  items: readonly Item[],
  added: readonly Item[],
  options: { enabled?: boolean } = {},
): RebuyResult {
  // @solution-start Keep a Map from id to its replacement. Loop over `added`, then over `items`. Build the result with items.map so unchanged items are returned as they are.
  if (options.enabled === false) return { items: [...items], replaced: [] };
  const replacedBy = new Map<string, Item>();
  const replaced: { older: Item; newer: Item }[] = [];
  for (const newer of added) {
    if (newer.used) continue;
    for (const older of items) {
      if (replacedBy.has(older.id) || !isRebuy(older, newer)) continue;
      const copy: Item = { ...older, used: true, replacedBy: newer.id };
      replacedBy.set(older.id, copy);
      replaced.push({ older, newer });
    }
  }
  return { items: items.map((i) => replacedBy.get(i.id) ?? i), replaced };
  // @solution-end
}
