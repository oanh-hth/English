import { todo } from '@/shared/todo';
import type { Chart } from '@/shared/types';
import { rowStats } from './rowStats';

export interface RowHint {
  rowId: string;
  /** Stitches this row works into. */
  used: number;
  /** Stitches the previous row left. */
  previous: number;
}

/**
 * Exercise 1.5: spot rows that probably have a mistake.
 *
 * A row gets a hint when ALL of these are true:
 *  - it is not the first row,
 *  - it does not have skipCheck set,
 *  - it works into at least 1 stitch (used > 0) and the previous row left at least 1 (made > 0),
 *  - the two numbers differ by MORE than 1 (a difference of 1 is normal: turning chains, starting chains).
 *
 * Return the hints in row order.
 */
export function rowHints(chart: Chart): RowHint[] {
  // TODO(1.5)
  return todo('1.5');
}
