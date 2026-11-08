import type { Chart, Item, LoopMod, Row, StitchId } from '@/shared/types';
import { DEFAULT_ROW_COLOR } from '@/shared/palette';
import { newId } from '@/shared/id';

export function createRow(color: string = DEFAULT_ROW_COLOR): Row {
  return { id: newId(), color, note: '', items: [] };
}

export function addRow(chart: Chart, color?: string): Chart {
  const last = chart.rows[chart.rows.length - 1];
  return { ...chart, rows: [...chart.rows, createRow(color ?? last?.color ?? DEFAULT_ROW_COLOR)] };
}

export function removeRow(chart: Chart, rowId: string): Chart {
  if (!chart.rows.some((r) => r.id === rowId)) return chart;
  return { ...chart, rows: chart.rows.filter((r) => r.id !== rowId) };
}

export function moveRow(chart: Chart, rowId: string, direction: 'up' | 'down'): Chart {
  const from = chart.rows.findIndex((r) => r.id === rowId);
  const to = direction === 'up' ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= chart.rows.length) return chart;
  const rows = [...chart.rows];
  [rows[from], rows[to]] = [rows[to], rows[from]];
  return { ...chart, rows };
}

export interface StitchToAdd {
  st: StitchId;
  n: number;
  mod: LoopMod;
}

function updateRow(chart: Chart, rowId: string, change: (row: Row) => Row): Chart {
  if (!chart.rows.some((r) => r.id === rowId)) return chart;
  return { ...chart, rows: chart.rows.map((r) => (r.id === rowId ? change(r) : r)) };
}

function appendStitch(list: Item[], stitch: StitchToAdd): Item[] {
  const last = list[list.length - 1];
  if (last && last.kind === 'st' && last.st === stitch.st && last.mod === stitch.mod) {
    return [...list.slice(0, -1), { ...last, n: Math.min(99, last.n + stitch.n) }];
  }
  return [...list, { kind: 'st', st: stitch.st, n: stitch.n, mod: stitch.mod }];
}

export function addStitch(chart: Chart, rowId: string, stitch: StitchToAdd, groupIndex?: number): Chart {
  return updateRow(chart, rowId, (row) => {
    const target = groupIndex === undefined ? undefined : row.items[groupIndex];
    if (target && target.kind === 'grp') {
      const items = row.items.map((item, i) => (i === groupIndex ? { ...target, items: appendStitch(target.items, stitch) } : item));
      return { ...row, items };
    }
    return { ...row, items: appendStitch(row.items, stitch) };
  });
}

export function addGroup(chart: Chart, rowId: string, rep = 2): Chart {
  return updateRow(chart, rowId, (row) => ({ ...row, items: [...row.items, { kind: 'grp', rep, items: [] }] }));
}

export function removeItem(chart: Chart, rowId: string, index: number, groupIndex?: number): Chart {
  return updateRow(chart, rowId, (row) => {
    if (groupIndex === undefined) return { ...row, items: row.items.filter((_, i) => i !== index) };
    const group = row.items[groupIndex];
    if (!group || group.kind !== 'grp') return row;
    const items = row.items.map((item, i) => (i === groupIndex ? { ...group, items: group.items.filter((_, j) => j !== index) } : item));
    return { ...row, items };
  });
}
