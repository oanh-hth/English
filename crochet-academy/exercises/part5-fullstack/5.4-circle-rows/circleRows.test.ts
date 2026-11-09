import { describe, expect, it } from 'vitest';
import { circleRows, STITCHES_PER_ROUND, type CircleStitch } from '@/core/circleRows';
import { rowStats } from '@/core/rowStats';
import { grp, st } from '../../_helpers/fixtures';

const STITCHES: CircleStitch[] = ['sc', 'hdc', 'dc'];

describe('5.4 circleRows: the numbers', () => {
  it.each(STITCHES)('every %s round k leaves n0 * k stitches', (stitch) => {
    const n0 = STITCHES_PER_ROUND[stitch];
    const rows = circleRows(stitch, 8, '#abcdef');
    expect(rows).toHaveLength(8);
    rows.forEach((row, i) => expect(rowStats(row.items).made).toBe(n0 * (i + 1)));
  });

  it('a single crochet circle works into exactly what the last round made', () => {
    const rows = circleRows('sc', 7, '#abcdef');
    for (let i = 1; i < rows.length; i++) expect(rowStats(rows[i].items).used).toBe(rowStats(rows[i - 1].items).made);
  });
});

describe('5.4 circleRows: the shape of the rows', () => {
  it('round 1 is a magic ring and the stitches', () => {
    expect(circleRows('sc', 1, '#111111')[0].items).toEqual([st('mr'), st('sc', 6)]);
    expect(circleRows('dc', 1, '#111111')[0].items).toEqual([st('mr'), st('dc', 12)]);
    expect(circleRows('sc', 1, '#111111')[0].note).toBe('Start with a magic ring.');
  });

  it('single crochet: increases, then (sc x (k-2), inc) groups', () => {
    const rows = circleRows('sc', 4, '#111111');
    expect(rows[1].items).toEqual([st('inc', 6)]);
    expect(rows[2].items).toEqual([grp(6, st('sc'), st('inc'))]);
    expect(rows[3].items).toEqual([grp(6, st('sc', 2), st('inc'))]);
    expect(rows.slice(1).every((r) => !r.skipCheck && r.note === '')).toBe(true);
  });

  it('taller stitches work two stitches into one, and explain it in the note', () => {
    const rows = circleRows('hdc', 4, '#111111');
    expect(rows[1].items).toEqual([grp(8, st('hdc', 2))]);
    expect(rows[2].items).toEqual([grp(8, st('hdc'), st('hdc', 2))]);
    expect(rows[3].items).toEqual([grp(8, st('hdc', 2), st('hdc', 2))]);
    expect(rows[1].note).toBe('2 hdc in every stitch.');
    expect(rows[3].note).toBe('2 hdc, then 2 hdc in the next stitch, 8 times.');
  });

  it('turns off the count check for those rows, but not for round 1', () => {
    const rows = circleRows('dc', 3, '#111111');
    expect(rows[0].skipCheck).toBeUndefined();
    expect(rows[1].skipCheck).toBe(true);
    expect(rows[2].skipCheck).toBe(true);
  });
});

describe('5.4 circleRows: the details', () => {
  it('uses the colour on every row and a fresh id for each', () => {
    const rows = circleRows('sc', 5, '#c3d8b4');
    expect(rows.every((r) => r.color === '#c3d8b4')).toBe(true);
    expect(new Set(rows.map((r) => r.id)).size).toBe(5);
    const again = circleRows('sc', 5, '#c3d8b4');
    expect(again[0].id).not.toBe(rows[0].id);
  });

  it('keeps the number of rounds between 1 and 30', () => {
    expect(circleRows('sc', 0, '#111111')).toHaveLength(1);
    expect(circleRows('sc', -4, '#111111')).toHaveLength(1);
    expect(circleRows('sc', 100, '#111111')).toHaveLength(30);
  });

  it('rounds a fractional number of rounds', () => {
    expect(circleRows('sc', 4.6, '#111111')).toHaveLength(5);
    expect(circleRows('sc', Number.NaN, '#111111')).toHaveLength(1);
  });

  it('only uses stitch items with no loop modifier', () => {
    const items = circleRows('dc', 4, '#111111').flatMap((r) => r.items.flatMap((i) => (i.kind === 'grp' ? i.items : [i])));
    expect(items.every((i) => i.kind === 'st' && i.mod === '')).toBe(true);
  });
});
