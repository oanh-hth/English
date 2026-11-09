import { describe, expect, it } from 'vitest';
import { itemText, rowText } from '@/core/rowText';
import { grp, st } from '../../_helpers/fixtures';

describe('1.4 itemText', () => {
  it('a single stitch is just its abbreviation', () => {
    expect(itemText(st('sc'))).toBe('sc');
    expect(itemText(st('sl'))).toBe('sl st');
  });

  it('puts the count first', () => {
    expect(itemText(st('sc', 6))).toBe('6 sc');
    expect(itemText(st('hdc', 12))).toBe('12 hdc');
  });

  it('adds the loop modifier after the name', () => {
    expect(itemText(st('sc', 6, 'BLO'))).toBe('6 sc BLO');
    expect(itemText(st('dc', 1, 'FLO'))).toBe('dc FLO');
  });

  it('chains put the count after the name', () => {
    expect(itemText(st('ch', 5))).toBe('ch 5');
    expect(itemText(st('ch'))).toBe('ch 1');
    expect(itemText(st('tch', 2))).toBe('t-ch 2');
  });

  it('writes groups with a repeat sign', () => {
    expect(itemText(grp(6, st('sc'), st('inc')))).toBe('(sc, inc) × 6');
    expect(itemText(grp(12, st('dc', 2), st('ch')))).toBe('(2 dc, ch 1) × 12');
  });

  it('writes nested groups', () => {
    expect(itemText(grp(2, st('sc'), grp(3, st('ch'))))).toBe('(sc, (ch 1) × 3) × 2');
  });

  it('an empty group keeps a space between the brackets', () => {
    expect(itemText(grp(2))).toBe('( ) × 2');
  });

  it('uses UK names when asked', () => {
    expect(itemText(st('dc', 3), true)).toBe('3 tr');
    expect(itemText(st('sc', 2), true)).toBe('2 dc');
  });
});

describe('1.4 rowText', () => {
  it('joins items and adds the stitch count made', () => {
    expect(rowText([st('mr'), st('sc', 6)])).toBe('MR, 6 sc (6)');
  });

  it('counts what the row makes, not how many cells it has', () => {
    expect(rowText([grp(6, st('sc'), st('inc'))])).toBe('(sc, inc) × 6 (18)');
  });

  it('shows an empty row clearly', () => {
    expect(rowText([])).toBe('(empty) (0)');
  });

  it('passes the UK flag down', () => {
    expect(rowText([st('ch', 3), st('dc', 4)], true)).toBe('ch 3, 4 tr (7)');
  });
});
