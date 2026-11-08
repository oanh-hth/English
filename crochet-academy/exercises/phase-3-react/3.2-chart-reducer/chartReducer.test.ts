import { describe, expect, it } from 'vitest';
import { chartReducer, type ChartAction } from '@/client/state/chartReducer';
import { chart, deepFreeze, grp, row, st } from '../../_helpers/fixtures';

const start = () => deepFreeze(chart([row('a', [st('sc', 2)]), row('b', [])], 'flat', 'Coaster'));
const run = (action: ChartAction, state = start()) => chartReducer(state, action);

describe('3.2 chartReducer: chart settings', () => {
  it('renames', () => {
    expect(run({ type: 'rename', name: 'Leaf' }).name).toBe('Leaf');
  });
  it('switches mode', () => {
    expect(run({ type: 'setMode', mode: 'round' }).mode).toBe('round');
  });
});

describe('3.2 chartReducer: rows', () => {
  it('adds a row', () => {
    expect(run({ type: 'addRow' }).rows).toHaveLength(3);
    expect(run({ type: 'addRow', color: '#010203' }).rows[2].color).toBe('#010203');
  });
  it('removes a row', () => {
    expect(run({ type: 'removeRow', rowId: 'a' }).rows.map((r) => r.id)).toEqual(['b']);
  });
  it('moves a row', () => {
    expect(run({ type: 'moveRow', rowId: 'b', direction: 'up' }).rows.map((r) => r.id)).toEqual(['b', 'a']);
  });
});

describe('3.2 chartReducer: stitches', () => {
  it('adds a stitch (merging like 1.6)', () => {
    const next = run({ type: 'addStitch', rowId: 'a', stitch: { st: 'sc', n: 3, mod: '' } });
    expect(next.rows[0].items).toEqual([st('sc', 5)]);
  });
  it('adds a group and then a stitch inside it', () => {
    const withGroup = run({ type: 'addGroup', rowId: 'b', rep: 6 });
    expect(withGroup.rows[1].items).toEqual([grp(6)]);
    const inside = chartReducer(withGroup, { type: 'addStitch', rowId: 'b', stitch: { st: 'inc', n: 1, mod: '' }, groupIndex: 0 });
    expect(inside.rows[1].items).toEqual([grp(6, st('inc'))]);
  });
  it('removes an item', () => {
    expect(run({ type: 'removeItem', rowId: 'a', index: 0 }).rows[0].items).toEqual([]);
  });
});

describe('3.2 chartReducer: row details', () => {
  it('sets a note and a colour', () => {
    expect(run({ type: 'setNote', rowId: 'b', note: 'change yarn' }).rows[1].note).toBe('change yarn');
    expect(run({ type: 'setColor', rowId: 'b', color: '#ff0000' }).rows[1].color).toBe('#ff0000');
  });
  it('dismisses a hint', () => {
    expect(run({ type: 'dismissHint', rowId: 'a' }).rows[0].skipCheck).toBe(true);
  });
  it('only touches the chosen row', () => {
    const state = start();
    const next = chartReducer(state, { type: 'setNote', rowId: 'b', note: 'x' });
    expect(next.rows[0]).toBe(state.rows[0]); // untouched rows are reused, not copied
    expect(next.rows[1].note).toBe('x');
  });
});

describe('3.2 chartReducer: no-ops return the same state', () => {
  const noops: ChartAction[] = [
    { type: 'setNote', rowId: 'zzz', note: 'x' },
    { type: 'setColor', rowId: 'zzz', color: '#000000' },
    { type: 'dismissHint', rowId: 'zzz' },
    { type: 'removeRow', rowId: 'zzz' },
    { type: 'moveRow', rowId: 'a', direction: 'up' },
  ];
  it.each(noops)('%j', (action) => {
    const state = start();
    expect(chartReducer(state, action)).toBe(state);
  });
});
