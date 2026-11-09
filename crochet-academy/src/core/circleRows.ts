import { todo } from '@/shared/todo';
import type { Row } from '@/shared/types';
import { newId } from '@/shared/id';

export type CircleStitch = 'sc' | 'hdc' | 'dc';

/** A flat circle grows by this many stitches every round: taller stitches need more increases. */
export const STITCHES_PER_ROUND: Record<CircleStitch, number> = { sc: 6, hdc: 8, dc: 12 };

/**
 * Exercise 5.4: generate the pattern for a flat circle.
 * The photo importer measures a coaster's colour and number of rounds; this function turns that into rows.
 * With n0 = STITCHES_PER_ROUND[stitch], round k (counting from 1) must leave n0 * k stitches.
 *
 *  - Clamp `rounds` to a whole number from 1 to 30.
 *  - Round 1:  MR, then n0 of the stitch (item "mr" x1 and item stitch x n0). note: "Start with a magic ring."
 *  - sc circles:
 *      round 2:    n0 increases        -> [ inc x n0 ]
 *      round k>=3: (sc x (k-2), inc) x n0 -> [ group rep n0 of [ sc x (k-2), inc x 1 ] ]
 *  - hdc and dc circles ("inc" is only defined for sc, so work 2 stitches in one stitch instead):
 *      round 2:    [ group rep n0 of [ stitch x 2 ] ]            note: `2 ${stitch} in every stitch.`
 *      round k>=3: [ group rep n0 of [ stitch x (k-2), stitch x 2 ] ]
 *                                                                 note: `${k - 2} ${stitch}, then 2 ${stitch} in the next stitch, ${n0} times.`
 *    These rows work into a different number of stitches than the formula in 1.5 expects, so set skipCheck: true on them.
 *  - Every row gets a fresh id (newId()) and the colour you were given. Unspecified notes are "".
 *  - All stitch items have mod "".
 */
export function circleRows(stitch: CircleStitch, rounds: number, color: string): Row[] {
  // TODO(5.4)
  return todo('5.4');
}
