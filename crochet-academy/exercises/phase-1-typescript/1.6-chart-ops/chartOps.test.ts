import { describe, expect, it } from 'vitest';
import { addGroup, addRow, addStitch, createRow, moveRow, removeItem, removeRow } from '@/core/chartOps';
import { chart, deepFreeze, grp, row, st } from '../../_helpers/fixtures';

const base = () =>
  deepFreeze(chart([row('a', [st('sc', 2)], { color: '#aaaaaa' }), row('b', [st('dc')], { color: '#bbbbbb' }), row('c', [])]));

describe('1.6 createRow / addRow', () => {
  it('createRow makes an empty row with a fresh id each time', () => {
    const r1 = createRow('#123456');
    const r2 = createRow();
    expect(r1).toMatchObject({ color: '#123456', note: '', items: [] });
    expect(r1.id).not.toBe(r2.id);
    expect(r1.id.length).toBeGreaterThan(0);
  });

  it('addRow appends a row that copies the colour of the last row', () => {
    const next = addRow(base());
    expect(next.rows).toHaveLength(4);
    expect(next.rows[3].color).toBe(base().rows[2].color);
    expect(next.rows[3].items).toEqual([]);
  });

  it('addRow accepts a colour, and does not touch the original', () => {
    const original = base();
    const next = addRow(original, '#ff0000');
    expect(next.rows[3].color).toBe('#ff0000');
    expect(original.rows).toHaveLength(3);
    expect(next).not.toBe(original);
  });

  it('the first row of an empty chart gets the default colour', () => {
    expect(addRow(chart([])).rows[0].color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('1.6 removeRow', () => {
  it('removes just that row', () => {
    expect(removeRow(base(), 'b').rows.map((r) => r.id)).toEqual(['a', 'c']);
  });
  it('returns the same chart for an unknown id', () => {
    const c = base();
    expect(removeRow(c, 'zzz')).toBe(c);
  });
});

describe('1.6 moveRow', () => {
  it('moves a row up and down', () => {
    expect(moveRow(base(), 'b', 'up').rows.map((r) => r.id)).toEqual(['b', 'a', 'c']);
    expect(moveRow(base(), 'b', 'down').rows.map((r) => r.id)).toEqual(['a', 'c', 'b']);
  });
  it('returns the same chart at the ends and for unknown ids', () => {
    const c = base();
    expect(moveRow(c, 'a', 'up')).toBe(c);
    expect(moveRow(c, 'c', 'down')).toBe(c);
    expect(moveRow(c, 'zzz', 'up')).toBe(c);
  });
});

describe('1.6 addStitch', () => {
  it('appends a new item', () => {
    const next = addStitch(base(), 'b', { st: 'sc', n: 3, mod: '' });
    expect(next.rows[1].items).toEqual([st('dc'), st('sc', 3)]);
  });

  it('merges with the last item when stitch and loop match', () => {
    const next = addStitch(base(), 'a', { st: 'sc', n: 4, mod: '' });
    expect(next.rows[0].items).toEqual([st('sc', 6)]);
  });

  it('does not merge when the loop modifier differs', () => {
    const next = addStitch(base(), 'a', { st: 'sc', n: 1, mod: 'BLO' });
    expect(next.rows[0].items).toEqual([st('sc', 2), st('sc', 1, 'BLO')]);
  });

  it('never goes above 99', () => {
    const c = chart([row('a', [st('sc', 98)])]);
    expect(addStitch(c, 'a', { st: 'sc', n: 5, mod: '' }).rows[0].items).toEqual([st('sc', 99)]);
  });

  it('adds inside a group when groupIndex points at one', () => {
    const c = deepFreeze(chart([row('a', [st('mr'), grp(6, st('sc'))])]));
    const next = addStitch(c, 'a', { st: 'inc', n: 1, mod: '' }, 1);
    expect(next.rows[0].items).toEqual([st('mr'), grp(6, st('sc'), st('inc'))]);
  });

  it('merges inside a group too', () => {
    const c = deepFreeze(chart([row('a', [grp(6, st('sc'))])]));
    expect(addStitch(c, 'a', { st: 'sc', n: 2, mod: '' }, 0).rows[0].items).toEqual([grp(6, st('sc', 3))]);
  });

  it('falls back to the row when groupIndex does not point at a group', () => {
    const c = deepFreeze(chart([row('a', [st('mr')])]));
    expect(addStitch(c, 'a', { st: 'sc', n: 1, mod: '' }, 0).rows[0].items).toEqual([st('mr'), st('sc')]);
    expect(addStitch(c, 'a', { st: 'sc', n: 1, mod: '' }, 7).rows[0].items).toEqual([st('mr'), st('sc')]);
  });

  it('returns the same chart for an unknown row', () => {
    const c = base();
    expect(addStitch(c, 'zzz', { st: 'sc', n: 1, mod: '' })).toBe(c);
  });
});

describe('1.6 addGroup / removeItem', () => {
  it('addGroup appends an empty group (repeat 2 by default)', () => {
    expect(addGroup(base(), 'c').rows[2].items).toEqual([grp(2)]);
    expect(addGroup(base(), 'c', 6).rows[2].items).toEqual([grp(6)]);
  });

  it('removeItem removes by index', () => {
    const c = deepFreeze(chart([row('a', [st('mr'), st('sc', 6), st('ch')])]));
    expect(removeItem(c, 'a', 1).rows[0].items).toEqual([st('mr'), st('ch')]);
  });

  it('removeItem can remove from inside a group', () => {
    const c = deepFreeze(chart([row('a', [grp(6, st('sc'), st('inc'))])]));
    expect(removeItem(c, 'a', 0, 0).rows[0].items).toEqual([grp(6, st('inc'))]);
  });

  it('removeItem leaves the chart alone for unknown rows', () => {
    const c = base();
    expect(removeItem(c, 'zzz', 0)).toBe(c);
  });
});
