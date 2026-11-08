import { todo } from '@/shared/todo';
import type { Chart, LoopMod, Row, StitchId } from '@/shared/types';
import { DEFAULT_ROW_COLOR } from '@/shared/palette';
import { newId } from '@/shared/id';

/**
 * Exercise 1.6: edit a chart WITHOUT changing the original (immutable updates).
 * The tests freeze their inputs: any mutation throws. Return NEW objects and arrays.
 * If a row id is not found, return the very same chart object you were given.
 */

/** A brand-new empty row with a fresh id and an empty note. */
export function createRow(color: string = DEFAULT_ROW_COLOR): Row {
  // TODO(1.6)
  return todo('1.6');
}

/** Append a row. With no colour given, copy the colour of the last row (or the default for the first). */
export function addRow(chart: Chart, color?: string): Chart {
  // TODO(1.6)
  return todo('1.6');
}

/** Remove the row with this id. */
export function removeRow(chart: Chart, rowId: string): Chart {
  // TODO(1.6)
  return todo('1.6');
}

/** Swap a row with its neighbour. At the top or bottom there is nothing to swap with: return the same chart. */
export function moveRow(chart: Chart, rowId: string, direction: 'up' | 'down'): Chart {
  // TODO(1.6)
  return todo('1.6');
}

export interface StitchToAdd {
  st: StitchId;
  n: number;
  mod: LoopMod;
}

/**
 * Add a stitch item to the end of a row, or inside the group at `groupIndex` of that row.
 * If the last item of the target list is a stitch with the same `st` and `mod`, add to its count instead
 * (never above 99). If `groupIndex` does not point at a group, add to the row itself.
 */
export function addStitch(chart: Chart, rowId: string, stitch: StitchToAdd, groupIndex?: number): Chart {
  // TODO(1.6)
  return todo('1.6');
}

/** Add an empty group (default repeat 2) to the end of a row. */
export function addGroup(chart: Chart, rowId: string, rep = 2): Chart {
  // TODO(1.6)
  return todo('1.6');
}

/** Remove the item at `index` of the row, or at `index` inside the group at `groupIndex`. */
export function removeItem(chart: Chart, rowId: string, index: number, groupIndex?: number): Chart {
  // TODO(1.6)
  return todo('1.6');
}
