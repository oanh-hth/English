import { describe, expect, it } from 'vitest';
import { rowHints } from '@/core/rowHints';
import { chart, grp, row, st } from '../../_helpers/fixtures';

describe('1.5 rowHints', () => {
  it('has no hints for an empty chart or a single row', () => {
    expect(rowHints(chart([]))).toEqual([]);
    expect(rowHints(chart([row('a', [st('sc', 6)])]))).toEqual([]);
  });

  it('is happy when a row works into exactly what the last row made', () => {
    const c = chart([row('a', [st('sc', 6)]), row('b', [st('inc', 6)])]);
    expect(rowHints(c)).toEqual([]);
  });

  it('flags a row that works into a different number of stitches', () => {
    const c = chart([row('a', [st('sc', 12)]), row('b', [st('sc', 8)])]);
    expect(rowHints(c)).toEqual([{ rowId: 'b', used: 8, previous: 12 }]);
  });

  it('allows a difference of one', () => {
    const c = chart([row('a', [st('ch', 12)]), row('b', [st('tch'), st('sc', 11)])]);
    expect(rowHints(c)).toEqual([]);
  });

  it('compares with what the previous row MADE (an increase row doubles)', () => {
    const c = chart([row('a', [st('mr'), st('sc', 6)]), row('b', [st('inc', 6)]), row('c', [grp(6, st('sc'), st('inc'))])]);
    expect(rowHints(c)).toEqual([]); // b uses 6 of 6, c uses 12 of 12
  });

  it('skips rows where the user dismissed the hint', () => {
    const c = chart([row('a', [st('sc', 12)]), row('b', [st('sc', 4)], { skipCheck: true })]);
    expect(rowHints(c)).toEqual([]);
  });

  it('ignores rows that work into nothing (chains) and rows after empty rows', () => {
    const c = chart([row('a', [st('sc', 12)]), row('b', [st('ch', 3)]), row('c', [st('sc', 9)])]);
    expect(rowHints(c)).toEqual([{ rowId: 'c', used: 9, previous: 3 }]);
  });
});
