import { todo } from '@/shared/todo';
import type { Stitch, StitchCategory, StitchId } from '@/shared/types';
import { STITCHES } from '@/shared/stitches';

/** Exercise 1.1: look things up in the provided STITCHES catalogue. */

/** Return the stitch with this id. Throw an Error if there is none. */
export function getStitch(id: StitchId): Stitch {
  // TODO(1.1)
  return todo('1.1');
}

/** True when `value` is the id of a stitch in the catalogue (a type guard). */
export function isStitchId(value: string): value is StitchId {
  // TODO(1.1)
  return todo('1.1');
}

/** Group the catalogue by category, keeping the catalogue order inside each group. */
export function stitchesByCategory(): Record<StitchCategory, Stitch[]> {
  // TODO(1.1)
  return todo('1.1');
}

/** The abbreviation and name to show. With `uk` true, use the stitch's UK names when it has them. */
export function displayName(id: StitchId, uk: boolean): { abbr: string; name: string } {
  // TODO(1.1)
  return todo('1.1');
}
