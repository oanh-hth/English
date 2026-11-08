import { todo } from '@/shared/todo';
import type { Item } from '@/shared/types';
import { expand } from './expand';
import { getStitch } from './stitchLookup';

export interface RowStats {
  /** How many stitches you work (cells), including ones that leave nothing, like a magic ring. */
  cells: number;
  /** Stitches left on the row when you finish. This is the number shown in brackets in patterns. */
  made: number;
  /** Stitches of the row below that you work into. */
  used: number;
}

/**
 * Exercise 1.3: count a row.
 *
 *   6 sc            -> cells 6, made 6,  used 6
 *   6 inc           -> cells 6, made 12, used 6   (an increase leaves 2 and works into 1)
 *   MR, 6 sc        -> cells 7, made 6,  used 6   (a magic ring leaves 0 and works into 0)
 *
 * Use expand() from 1.2 and getStitch() from 1.1.
 */
export function rowStats(items: Item[]): RowStats {
  // TODO(1.3)
  return todo('1.3');
}
