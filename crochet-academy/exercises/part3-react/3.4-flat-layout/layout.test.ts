import { beforeEach, describe, expect, it } from 'vitest';
import type { FlatLayout } from '@/client/chart/layout';
import { layoutFlat } from '@/client/chart/layout';
import { grp, row, st } from '../../_helpers/fixtures';

const rows = [row('a', [st('sc', 3)]), row('b', [st('dc', 5)])];

describe('3.4 layoutFlat: size', () => {
  it('an empty chart is just padding around a minimum of 4 cells', () => {
    expect(layoutFlat([])).toMatchObject({ width: 4 * 40 + 100, height: 24, cells: [], labels: [] });
  });

  it('is as wide as the longest row (at least 4 cells) and as tall as the rows', () => {
    expect(layoutFlat(rows)).toMatchObject({ width: 5 * 40 + 100, height: 2 * 46 + 24 });
    expect(layoutFlat([row('x', [st('sc', 2)])]).width).toBe(4 * 40 + 100);
  });

  it('counts groups when working out row length', () => {
    expect(layoutFlat([row('x', [grp(3, st('sc', 2))])]).width).toBe(6 * 40 + 100);
  });
});

describe('3.4 layoutFlat: cells', () => {
  let layout: FlatLayout;
  beforeEach(() => { layout = layoutFlat(rows); });
  const cell = (rowIndex: number, index: number) => layout.cells.find((c) => c.rowIndex === rowIndex && c.index === index)!;

  it('lists one box per stitch, row by row', () => {
    expect(layout.cells).toHaveLength(8);
    expect(layout.cells.map((c) => c.rowIndex)).toEqual([0, 0, 0, 1, 1, 1, 1, 1]);
  });

  it('puts row 0 at the bottom', () => {
    expect(cell(0, 0).y).toBe(12 + 46);
    expect(cell(1, 0).y).toBe(12);
  });

  it('works row 0 from right to left and centres it', () => {
    // 3 cells in a 5-wide chart: offset 40. First stitch is the rightmost.
    expect(cell(0, 0).x).toBe(50 + 40 + 2 * 40);
    expect(cell(0, 1).x).toBe(50 + 40 + 1 * 40);
    expect(cell(0, 2).x).toBe(50 + 40);
  });

  it('works row 1 from left to right', () => {
    expect(cell(1, 0).x).toBe(50);
    expect(cell(1, 4).x).toBe(50 + 4 * 40);
  });

  it('keeps the stitch type, loop modifier, row id and box size', () => {
    const l = layoutFlat([row('q', [st('sc', 1, 'BLO')])]);
    expect(l.cells[0]).toMatchObject({ rowId: 'q', st: 'sc', mod: 'BLO', w: 40, h: 46, rowIndex: 0, index: 0 });
  });

  it('honours custom sizes', () => {
    const l = layoutFlat([row('q', [st('sc', 4)])], { cellW: 10, cellH: 20, padX: 5, padY: 2 });
    expect(l.width).toBe(4 * 10 + 10);
    expect(l.height).toBe(20 + 4);
    expect(l.cells.map((c) => c.x)).toEqual([35, 25, 15, 5]);
    expect(l.cells[0]).toMatchObject({ y: 2, w: 10, h: 20 });
  });
});

describe('3.4 layoutFlat: row labels', () => {
  it('puts a label at the end where each row starts', () => {
    expect(layoutFlat(rows).labels).toEqual([
      { rowIndex: 0, text: '1 ←', side: 'right', x: 50 + 5 * 40 + 8, y: 58 + 23 },
      { rowIndex: 1, text: '→ 2', side: 'left', x: 42, y: 12 + 23 },
    ]);
  });
});
