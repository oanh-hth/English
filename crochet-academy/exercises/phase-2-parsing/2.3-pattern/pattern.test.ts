import { describe, expect, it } from 'vitest';
import { parsePattern } from '@/parse/pattern';
import { grp, st } from '../../_helpers/fixtures';

describe('2.3 parsePattern: headers and totals', () => {
  it('reads rounds with totals', () => {
    const p = parsePattern('Round 1: MR, 6 sc (6)\nRnd 2: 6 inc [12]\nR3: (sc, inc) x 6 = 18 sts');
    expect(p.rows.map((r) => r.items)).toEqual([
      [st('mr'), st('sc', 6)],
      [st('inc', 6)],
      [grp(6, st('sc'), st('inc'))],
    ]);
    expect(p.mode).toBe('round');
    expect(p.skipped).toEqual([]);
  });

  it('is flat for plain rows with no magic ring', () => {
    const p = parsePattern('Row 1: ch 12\nRow 2: ch 1, 11 sc');
    expect(p.mode).toBe('flat');
    expect(p.rows).toHaveLength(2);
  });

  it('is round when a magic ring is used even without the word round', () => {
    expect(parsePattern('Row 1: MR, 6 sc').mode).toBe('round');
    expect(parsePattern('Row 1: (MR, 6 sc) x 1').mode).toBe('round'); // the ring may be inside a group
  });

  it('accepts ")" and "." after the number', () => {
    expect(parsePattern('Row 1) 3 sc\nRow 2. 4 sc').rows.map((r) => r.items)).toEqual([[st('sc', 3)], [st('sc', 4)]]);
  });
});

describe('2.3 parsePattern: layout of the text', () => {
  it('ignores lines before the first header', () => {
    const p = parsePattern('Pink coaster\nby me\nRound 1: MR, 6 sc');
    expect(p.rows).toHaveLength(1);
    expect(p.skipped).toEqual([]);
  });

  it('splits headers in the middle of a line', () => {
    const p = parsePattern('Round 1: MR, 8 dc. Round 2: (dc, ch 2) x 8.');
    expect(p.rows).toHaveLength(2);
    expect(p.rows[1].items).toEqual([grp(8, st('dc'), st('ch', 2))]);
  });

  it('joins continuation lines to the previous row', () => {
    const p = parsePattern('Round 2: (sc, inc) x 3,\n  sl st\nRound 3: sc');
    expect(p.rows[0].items).toEqual([grp(3, st('sc'), st('inc')), st('sl')]);
    const q = parsePattern('Round 2: 3 sc\n2 dc');
    expect(q.rows[0].items).toEqual([st('sc', 3), st('dc', 2)]);
  });

  it('treats every line as a row when there are no headers', () => {
    const p = parsePattern('6 sc\n(sc, inc) x 6');
    expect(p.rows.map((r) => r.items)).toEqual([[st('sc', 6)], [grp(6, st('sc'), st('inc'))]]);
  });

  it('copes with CRLF line endings and en dashes in ranges', () => {
    const p = parsePattern('Round 1: 6 sc\r\nRounds 2–3: 6 sc');
    expect(p.rows).toHaveLength(3);
  });
});

describe('2.3 parsePattern: ranges, unknowns, UK', () => {
  it('repeats a row for a range of rounds (at most 12)', () => {
    const p = parsePattern('Rounds 3-5: sc around');
    expect(p.rows).toHaveLength(3);
    expect(p.rows[2].items).toEqual([st('sc')]);
    expect(parsePattern('Rounds 1-40: sc').rows).toHaveLength(12);
  });

  it('copies are independent objects', () => {
    const p = parsePattern('Rounds 1-2: sc');
    p.rows[0].items.push(st('dc'));
    expect(p.rows[1].items).toEqual([st('sc')]);
  });

  it('reports unreadable pieces per row and skips unreadable rows', () => {
    const p = parsePattern('Round 1: sc, wibble\nRound 2: blah blah');
    expect(p.rows).toHaveLength(1);
    expect(p.rows[0].unknown).toEqual(['wibble']);
    expect(p.skipped).toEqual(['blah blah']);
  });

  it('reads UK terms with options.uk', () => {
    const p = parsePattern('Round 1: 6 dc into a magic ring', { uk: true });
    expect(p.rows[0].items).toEqual([st('sc', 6)]);
  });

  it('returns an empty result for nothing', () => {
    expect(parsePattern('')).toEqual({ rows: [], mode: 'flat', skipped: [] });
  });
});
