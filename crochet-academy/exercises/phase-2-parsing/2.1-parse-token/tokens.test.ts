import { describe, expect, it } from 'vitest';
import { matchStitchName, parseToken, type ParseContext } from '@/parse/tokens';
import { st } from '../../_helpers/fixtures';

const ctx = (uk = false): ParseContext => ({ uk, unknown: [] });

describe('2.1 matchStitchName', () => {
  it('finds a name at the start and returns the rest', () => {
    expect(matchStitchName('sc in next st')).toEqual({ id: 'sc', word: 'sc', rest: 'in next st' });
  });

  it('is case-insensitive and tolerates spacing', () => {
    expect(matchStitchName('Double  Crochet')).toEqual({ id: 'dc', word: 'double crochet', rest: '' });
    expect(matchStitchName('  SL ST')).toMatchObject({ id: 'sl', rest: '' });
  });

  it('prefers the more specific name', () => {
    expect(matchStitchName('double treble')?.id).toBe('dtr');
    expect(matchStitchName('invisible decrease')?.id).toBe('invdec');
    expect(matchStitchName('dec')?.id).toBe('dec');
  });

  it('only matches at the start and at a word boundary', () => {
    expect(matchStitchName('scarf')).toBeNull();
    expect(matchStitchName('then sc')).toBeNull();
    expect(matchStitchName('wibble')).toBeNull();
  });

  it('allows a number right after the name', () => {
    expect(matchStitchName('dc2')).toEqual({ id: 'dc', word: 'dc', rest: '2' });
  });
});

describe('2.1 parseToken: counts', () => {
  it.each([
    ['sc', st('sc', 1)],
    ['6 sc', st('sc', 6)],
    ['6sc', st('sc', 6)],
    ['6 x sc', st('sc', 6)],
    ['sc 6', st('sc', 6)],
    ['ch 5', st('ch', 5)],
    ['ch-5', st('ch', 5)],
    ['  12   HDC ', st('hdc', 12)],
    ['Magic Ring', st('mr', 1)],
  ])('reads %j', (text, expected) => {
    const c = ctx();
    expect(parseToken(text, c)).toEqual(expected);
    expect(c.unknown).toEqual([]);
  });

  it('limits counts to 1..99', () => {
    expect(parseToken('500 sc', ctx())).toEqual(st('sc', 99));
    expect(parseToken('0 sc', ctx())).toEqual(st('sc', 1));
  });
});

describe('2.1 parseToken: words around the stitch', () => {
  it('ignores "in next st", "around", "across"', () => {
    const c = ctx();
    expect(parseToken('2 dc in next st', c)).toEqual(st('dc', 2));
    expect(parseToken('sc around', c)).toEqual(st('sc', 1));
    expect(parseToken('4 hdc across', c)).toEqual(st('hdc', 4));
    expect(c.unknown).toEqual([]);
  });

  it('ignores a leading then / and / work', () => {
    expect(parseToken('then 3 dc', ctx())).toEqual(st('dc', 3));
    expect(parseToken('and sc', ctx())).toEqual(st('sc'));
    expect(parseToken('work 2 sc.', ctx())).toEqual(st('sc', 2));
  });

  it('returns null and records nothing for turn / fasten off / empty', () => {
    const c = ctx();
    for (const text of ['turn', 'Fasten off', '', '   ']) expect(parseToken(text, c)).toBeNull();
    expect(c.unknown).toEqual([]);
  });
});

describe('2.1 parseToken: loops', () => {
  it('reads BLO and FLO', () => {
    expect(parseToken('6 sc BLO', ctx())).toEqual(st('sc', 6, 'BLO'));
    expect(parseToken('dc FLO', ctx())).toEqual(st('dc', 1, 'FLO'));
    expect(parseToken('sc in back loop only', ctx())).toEqual(st('sc', 1, 'BLO'));
  });

  it('drops the modifier for stitches that do not allow it', () => {
    expect(parseToken('3 ch BLO', ctx())).toEqual(st('ch', 3));
  });
});

describe('2.1 parseToken: UK terms', () => {
  it('translates UK words when ctx.uk is true', () => {
    expect(parseToken('3 tr', ctx(true))).toEqual(st('dc', 3));
    expect(parseToken('2 dc', ctx(true))).toEqual(st('sc', 2));
    expect(parseToken('htr', ctx(true))).toEqual(st('hdc'));
  });

  it('keeps US meanings otherwise', () => {
    expect(parseToken('3 tr', ctx(false))).toEqual(st('tr', 3));
  });
});

describe('2.1 parseToken: things it cannot read', () => {
  it('records an unknown stitch and returns null', () => {
    const c = ctx();
    expect(parseToken('  wibble 3 ', c)).toBeNull();
    expect(c.unknown).toEqual(['wibble 3']);
  });

  it('keeps the item but records odd leftovers', () => {
    const c = ctx();
    expect(parseToken('6 sc wobble', c)).toEqual(st('sc', 6));
    expect(c.unknown).toEqual(['6 sc wobble']);
  });
});
