import { todo } from '@/shared/todo';
import type { ChartMode, Item } from '@/shared/types';

export interface ParsedRow {
  items: Item[];
  /** Pieces of this row's text that could not be understood. */
  unknown: string[];
}

export interface ParsedPattern {
  rows: ParsedRow[];
  mode: ChartMode;
  /** Text of rows that contained nothing readable. */
  skipped: string[];
}

/**
 * Exercise 2.3: read a whole written pattern.
 *
 *   Round 1: MR, 6 sc (6)
 *   Rnd 2: 6 inc [12]
 *   R3: (sc, inc) x 6 = 18 sts
 *
 * Rules
 *  - A row starts with a header: round / rounds / rnd / row / rows / r, a number (or a range "3-5"),
 *    then ":" "." or ")". Case does not matter.  "Rounds 3-5: sc around" makes THREE identical rows (at most 12).
 *  - Headers may appear in the middle of a line when followed by a colon: "Round 1: MR, 6 sc Round 2: 6 inc" is two rows.
 *  - Lines BEFORE the first header are ignored (titles, chatter).
 *  - A line after a header that is not itself a header continues the previous row: join with a space when the
 *    previous text ends with "," or ";" or "(", otherwise with ", ".
 *  - If there are no headers at all, every non-empty line is its own row.
 *  - Strip a trailing total before parsing: "(12)", "[12]", "(12 sts)", "= 18 sts".
 *  - Parse the rest with parseSequence (2.2). If it gives no items and there was text, add the text to `skipped`
 *    and make no row.
 *  - mode is 'round' when the text mentions round/rnd as a word or any row uses a magic ring (MR); otherwise 'flat'.
 *  - options.uk reads UK terms.
 */
export function parsePattern(text: string, options: { uk?: boolean } = {}): ParsedPattern {
  // TODO(2.3)
  return todo('2.3');
}
