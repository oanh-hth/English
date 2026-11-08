import type { Item } from '@/shared/types';
import { expand } from './expand';
import { getStitch } from './stitchLookup';

export interface RowStats {
  cells: number;
  made: number;
  used: number;
}

export function rowStats(items: Item[]): RowStats {
  const cells = expand(items);
  return cells.reduce<RowStats>(
    (total, cell) => {
      const stitch = getStitch(cell.st);
      return { cells: total.cells + 1, made: total.made + stitch.makes, used: total.used + stitch.uses };
    },
    { cells: 0, made: 0, used: 0 },
  );
}
