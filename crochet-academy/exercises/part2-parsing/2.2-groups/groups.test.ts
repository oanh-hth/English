import { describe, expect, it } from 'vitest';
import { parseSequence, splitTop } from '@/parse/groups';
import type { ParseContext } from '@/parse/tokens';
import { grp, st } from '../../_helpers/fixtures';

const ctx = (): ParseContext => ({ uk: false, unknown: [] });

describe('2.2 splitTop', () => {
  it('splits on commas and semicolons', () => {
    expect(splitTop('sc, inc; 2 dc')).toEqual(['sc', 'inc', '2 dc']);
  });

  it('does not split inside brackets', () => {
    expect(splitTop('(sc, inc) x 6, ch 2')).toEqual(['(sc, inc) x 6', 'ch 2']);
    expect(splitTop('sc; ((dc, ch 1) x 2), sc')).toEqual(['sc', '((dc, ch 1) x 2)', 'sc']);
    expect(splitTop('[sc, inc] 6 times, dc')).toEqual(['[sc, inc] 6 times', 'dc']);
  });

  it('trims pieces and drops empty ones', () => {
    expect(splitTop(' sc ,, inc , ')).toEqual(['sc', 'inc']);
    expect(splitTop('')).toEqual([]);
  });

  it('survives unbalanced brackets', () => {
    expect(splitTop('(sc, inc')).toEqual(['(sc, inc']);
    expect(splitTop('sc), inc')).toEqual(['sc)', 'inc']);
  });
});

describe('2.2 parseSequence', () => {
  it('parses plain stitches', () => {
    expect(parseSequence('MR, 6 sc', ctx())).toEqual([st('mr'), st('sc', 6)]);
  });

  it('parses a group with "x N"', () => {
    expect(parseSequence('(sc, inc) x 6', ctx())).toEqual([grp(6, st('sc'), st('inc'))]);
    expect(parseSequence('(sc, inc) ×6', ctx())).toEqual([grp(6, st('sc'), st('inc'))]);
  });

  it('parses "N times" with square brackets', () => {
    expect(parseSequence('[2 dc, ch 1] 12 times', ctx())).toEqual([grp(12, st('dc', 2), st('ch'))]);
  });

  it('"repeat N more times" means N + 1 in total', () => {
    expect(parseSequence('(sc, inc) repeat 5 more times', ctx())).toEqual([grp(6, st('sc'), st('inc'))]);
    expect(parseSequence('(sc, inc) repeat 4 times', ctx())).toEqual([grp(4, st('sc'), st('inc'))]);
  });

  it('nests groups', () => {
    expect(parseSequence('(sc, (ch 1) x 2) x 3', ctx())).toEqual([grp(3, st('sc'), grp(2, st('ch')))]);
  });

  it('adds brackets without a repeat marker inline', () => {
    const c = ctx();
    expect(parseSequence('(2 dc, ch 1) sc', c)).toEqual([st('dc', 2), st('ch'), st('sc')]);
    expect(c.unknown).toEqual([]);
  });

  it('keeps going after a repeat marker', () => {
    expect(parseSequence('(sc, inc) x 6 sl st', ctx())).toEqual([grp(6, st('sc'), st('inc')), st('sl')]);
    expect(parseSequence('(dc) x 2, ch 3', ctx())).toEqual([grp(2, st('dc')), st('ch', 3)]);
  });

  it('limits repeats to 1..99 and drops empty groups', () => {
    expect(parseSequence('(sc) x 500', ctx())).toEqual([grp(99, st('sc'))]);
    expect(parseSequence('(wibble) x 3', ctx())).toEqual([]);
  });

  it('shares ctx so unreadable text is collected', () => {
    const c = ctx();
    expect(parseSequence('sc, wibble, (dc, blah) x 2', c)).toEqual([st('sc'), grp(2, st('dc'))]);
    expect(c.unknown).toEqual(['wibble', 'blah']);
  });

  it('handles UK terms through ctx', () => {
    expect(parseSequence('(tr, ch 1) x 3', { uk: true, unknown: [] })).toEqual([grp(3, st('dc'), st('ch'))]);
  });
});
