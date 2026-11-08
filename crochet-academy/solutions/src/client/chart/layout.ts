import type { LoopMod, Row, StitchId } from '@/shared/types';
import { expand } from '@/core/expand';

export interface LayoutOptions {
  cellW?: number;
  cellH?: number;
  padX?: number;
  padY?: number;
}

export interface CellBox {
  rowId: string;
  rowIndex: number;
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

export function layoutFlat(rows: Row[], options: LayoutOptions = {}): FlatLayout {
  const { cellW = 40, cellH = 46, padX = 50, padY = 12 } = options;
  const expanded = rows.map((row) => expand(row.items));
  const maxCells = Math.max(4, ...expanded.map((cells) => cells.length));
  const cells: CellBox[] = [];
  const labels: RowLabel[] = [];

  rows.forEach((row, rowIndex) => {
    const stitches = expanded[rowIndex];
    const y = padY + (rows.length - 1 - rowIndex) * cellH;
    const offset = ((maxCells - stitches.length) * cellW) / 2;
    const rightToLeft = rowIndex % 2 === 0;
    stitches.forEach((stitch, index) => {
      const slot = rightToLeft ? stitches.length - 1 - index : index;
      cells.push({ rowId: row.id, rowIndex, index, st: stitch.st, mod: stitch.mod, x: padX + offset + slot * cellW, y, w: cellW, h: cellH });
    });
    labels.push(
      rightToLeft
        ? { rowIndex, text: `${rowIndex + 1} ←`, side: 'right', x: padX + maxCells * cellW + 8, y: y + cellH / 2 }
        : { rowIndex, text: `→ ${rowIndex + 1}`, side: 'left', x: padX - 8, y: y + cellH / 2 },
    );
  });

  return { width: maxCells * cellW + 2 * padX, height: rows.length * cellH + 2 * padY, cells, labels };
}
