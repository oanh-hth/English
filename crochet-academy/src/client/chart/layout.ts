import { todo } from '@/shared/todo';
import type { LoopMod, Row, StitchId } from '@/shared/types';

export interface LayoutOptions {
  cellW?: number;
  cellH?: number;
  padX?: number;
  padY?: number;
}

export interface CellBox {
  rowId: string;
  /** Zero-based row number. */
  rowIndex: number;
  /** Position of the stitch in the order it is worked (0 = first). */
  index: number;
  st: StitchId;
  mod: LoopMod;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RowLabel {
  rowIndex: number;
  /** "1 ←" for rows worked right to left, "→ 2" for rows worked left to right. */
  text: string;
  side: 'left' | 'right';
  x: number;
  y: number;
}

export interface FlatLayout {
  width: number;
  height: number;
  cells: CellBox[];
  labels: RowLabel[];
}

/**
 * Exercise 3.4: where does every stitch go in a flat (rows, not rounds) symbol chart?
 * This is pure arithmetic: no React in sight. Defaults: cellW 40, cellH 46, padX 50, padY 12.
 *
 *  - Let `maxCells` be the number of stitches in the longest row, but at least 4 (use expand() from 1.2).
 *    width  = maxCells * cellW + 2 * padX         height = rows.length * cellH + 2 * padY
 *  - Row 0 is the BOTTOM of the chart (you start at the bottom): y = padY + (rows.length - 1 - rowIndex) * cellH.
 *  - A shorter row is centred: offset = (maxCells - cells) * cellW / 2.
 *  - Direction: rows 0, 2, 4... are worked right to left, so the FIRST stitch is on the right:
 *        x = padX + offset + (cells - 1 - index) * cellW
 *    rows 1, 3, 5... are worked left to right:   x = padX + offset + index * cellW
 *  - Each cell box is w = cellW, h = cellH.  Cells are listed row by row, in the order they are worked.
 *  - One label per row, at the end where the row starts, vertically centred (y = rowTop + cellH / 2):
 *        right-to-left rows: side 'right', x = padX + maxCells * cellW + 8, text `${rowIndex + 1} ←`
 *        left-to-right rows: side 'left',  x = padX - 8,                    text `→ ${rowIndex + 1}`
 */
export function layoutFlat(rows: Row[], options: LayoutOptions = {}): FlatLayout {
  // TODO(3.4)
  return todo('3.4');
}
