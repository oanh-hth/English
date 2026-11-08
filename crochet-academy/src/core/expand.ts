import { todo } from '@/shared/todo';
import type { Item, LoopMod, StitchId } from '@/shared/types';

/** One worked stitch. "6 sc" expands to six of these. */
export interface Cell {
  st: StitchId;
  mod: LoopMod;
}

/**
 * Exercise 1.2: flatten items into the list of individual stitches, in the order they are worked.
 *
 *   [ { kind: 'st', st: 'sc', n: 2 } ]                               -> sc, sc
 *   [ { kind: 'grp', rep: 2, items: [sc x1, inc x1] } ]              -> sc, inc, sc, inc
 *
 * Groups can contain groups. A count or repeat below 1 counts as 1.
 */
export function expand(items: Item[]): Cell[] {
  // TODO(1.2)
  return todo('1.2');
}
