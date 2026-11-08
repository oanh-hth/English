import { todo } from '@/shared/todo';
import type { Item } from '@/shared/types';
import { displayName } from './stitchLookup';
import { rowStats } from './rowStats';

/**
 * Exercise 1.4: write the pattern text.
 *
 * itemText:
 *   sc x1                    "sc"
 *   sc x6                    "6 sc"
 *   sc x6 with mod BLO       "6 sc BLO"
 *   ch x5  (and t-ch)        "ch 5"        <- chains put the number AFTER the name
 *   group rep 6 [sc, inc]    "(sc, inc) × 6"
 *   group with no items      "( ) × 2"     <- note the space inside the brackets
 * Names come from displayName(id, uk).
 *
 * rowText: the items joined with ", ", then the number of stitches made in brackets.
 *   MR, 6 sc  ->  "MR, 6 sc (6)"      empty row  ->  "(empty) (0)"
 */
export function itemText(item: Item, uk = false): string {
  // TODO(1.4)
  return todo('1.4');
}

export function rowText(items: Item[], uk = false): string {
  // TODO(1.4)
  return todo('1.4');
}
