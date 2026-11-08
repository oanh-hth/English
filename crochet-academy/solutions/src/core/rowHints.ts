import type { Chart } from '@/shared/types';
import { rowStats } from './rowStats';

export interface RowHint {
  rowId: string;
  used: number;
  previous: number;
}

export function rowHints(chart: Chart): RowHint[] {
  const hints: RowHint[] = [];
  chart.rows.forEach((row, index) => {
    if (index === 0 || row.skipCheck) return;
    const used = rowStats(row.items).used;
    const previous = rowStats(chart.rows[index - 1].items).made;
    if (used > 0 && previous > 0 && Math.abs(used - previous) > 1) hints.push({ rowId: row.id, used, previous });
  });
  return hints;
}
