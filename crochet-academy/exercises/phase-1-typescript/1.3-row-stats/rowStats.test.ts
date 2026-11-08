import { describe, expect, it } from 'vitest';
import { rowStats } from '@/core/rowStats';
import { grp, st } from '../../_helpers/fixtures';

describe('1.3 rowStats', () => {
  it('an empty row is all zeros', () => {
    expect(rowStats([])).toEqual({ cells: 0, made: 0, used: 0 });
  });

  it('plain stitches make one stitch each and work into one', () => {
    expect(rowStats([st('sc', 6)])).toEqual({ cells: 6, made: 6, used: 6 });
  });

  it('an increase makes two and works into one', () => {
    expect(rowStats([st('inc', 6)])).toEqual({ cells: 6, made: 12, used: 6 });
  });

  it('a decrease makes one and works into two', () => {
    expect(rowStats([st('dec', 3)])).toEqual({ cells: 3, made: 3, used: 6 });
  });

  it('a magic ring counts as a cell but leaves no stitch', () => {
    expect(rowStats([st('mr'), st('sc', 6)])).toEqual({ cells: 7, made: 6, used: 6 });
  });

  it('chains make stitches but work into none', () => {
    expect(rowStats([st('ch', 5)])).toEqual({ cells: 5, made: 5, used: 0 });
  });

  it('a shell leaves five stitches from one', () => {
    expect(rowStats([st('shell', 2)])).toEqual({ cells: 2, made: 10, used: 2 });
  });

  it('counts groups with their repeat', () => {
    // (sc, inc) x 6 -> 6 * (1 + 2) = 18 made, 6 * (1 + 1) = 12 used
    expect(rowStats([grp(6, st('sc'), st('inc'))])).toEqual({ cells: 12, made: 18, used: 12 });
  });

  it('mixes everything', () => {
    expect(rowStats([st('tch'), st('dc', 2), grp(2, st('ch'), st('sk'))])).toEqual({ cells: 7, made: 4, used: 4 });
  });
});
