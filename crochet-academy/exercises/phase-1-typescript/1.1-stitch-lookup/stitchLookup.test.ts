import { describe, expect, it } from 'vitest';
import { displayName, getStitch, isStitchId, stitchesByCategory } from '@/core/stitchLookup';
import { STITCHES } from '@/shared/stitches';
import type { StitchId } from '@/shared/types';

describe('1.1 getStitch', () => {
  it('finds a stitch by id', () => {
    expect(getStitch('sc').name).toBe('Single crochet');
    expect(getStitch('shell').makes).toBe(5);
  });

  it('throws for an id that does not exist', () => {
    expect(() => getStitch('nope' as StitchId)).toThrow(/nope/);
  });
});

describe('1.1 isStitchId', () => {
  it('accepts real ids and rejects other strings', () => {
    expect(isStitchId('dc')).toBe(true);
    expect(isStitchId('invdec')).toBe(true);
    expect(isStitchId('DC')).toBe(false);
    expect(isStitchId('')).toBe(false);
    expect(isStitchId('toString')).toBe(false); // careful with plain objects as lookup tables!
  });
});

describe('1.1 stitchesByCategory', () => {
  it('has the three categories', () => {
    expect(Object.keys(stitchesByCategory()).sort()).toEqual(['Basic', 'Shaping', 'Texture']);
  });

  it('puts each stitch in its own category, exactly once', () => {
    const groups = stitchesByCategory();
    expect(groups.Basic.map((s) => s.id)).toContain('sc');
    expect(groups.Shaping.map((s) => s.id)).toContain('inc');
    expect(groups.Texture.map((s) => s.id)).toContain('bob');
    const all = [...groups.Basic, ...groups.Shaping, ...groups.Texture];
    expect(all).toHaveLength(STITCHES.length);
  });

  it('keeps the catalogue order inside a group', () => {
    const ids = stitchesByCategory().Basic.map((s) => s.id);
    expect(ids.indexOf('ch')).toBeLessThan(ids.indexOf('sc'));
    expect(ids.indexOf('sc')).toBeLessThan(ids.indexOf('dc'));
  });
});

describe('1.1 displayName', () => {
  it('uses US names by default', () => {
    expect(displayName('dc', false)).toEqual({ abbr: 'dc', name: 'Double crochet' });
  });

  it('uses UK names when asked and the stitch has them', () => {
    expect(displayName('dc', true)).toEqual({ abbr: 'tr', name: 'Treble' });
    expect(displayName('sc', true)).toEqual({ abbr: 'dc', name: 'Double crochet' });
  });

  it('falls back to the US name when there is no UK name', () => {
    expect(displayName('inc', true)).toEqual({ abbr: 'inc', name: 'Increase' });
  });
});
