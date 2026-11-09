import { describe, expect, it } from 'vitest';
import { estimateRounds, movingAverage } from '@/core/estimateRounds';

/** A fake brightness profile: `waves` ripples between centre and edge, plus lighting drift and a little noise. */
function profile(waves: number, { length = 120, phase = 0, drift = 40, noise = 4, amplitude = 12 } = {}): number[] {
  let seed = 12345;
  const random = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296 - 0.5) * 2;
  return Array.from({ length }, (_, i) => {
    const t = (i + 0.5) / length;
    return 130 + drift * (1 - t) + amplitude * Math.cos(2 * Math.PI * waves * t + phase) + noise * random();
  });
}

describe('5.3 movingAverage', () => {
  it('averages with the neighbours', () => {
    expect(movingAverage([1, 2, 3, 4, 5], 1)).toEqual([1.5, 2, 3, 4, 4.5]);
  });

  it('radius 0 changes nothing, and does not return the same array', () => {
    const input = [3, 1, 4];
    const out = movingAverage(input, 0);
    expect(out).toEqual([3, 1, 4]);
    expect(out).not.toBe(input);
  });

  it('a window wider than the data averages everything', () => {
    expect(movingAverage([2, 4, 6], 10)).toEqual([4, 4, 4]);
  });

  it('handles an empty list', () => {
    expect(movingAverage([], 2)).toEqual([]);
  });
});

describe('5.3 estimateRounds: one profile', () => {
  it.each([6, 7, 9, 12, 15])('finds %i waves in a clean profile', (waves) => {
    expect(estimateRounds([profile(waves, { noise: 0 })])).toBe(waves);
  });

  it.each([7, 9, 12])('finds %i waves despite lighting drift and noise', (waves) => {
    expect(estimateRounds([profile(waves)])).toBe(waves);
  });

  it('does not depend on where the first wave starts', () => {
    for (const phase of [0, 1, 2, 3, 4, 5]) expect(estimateRounds([profile(9, { phase })])).toBe(9);
  });

  it('works with a different number of samples', () => {
    expect(estimateRounds([profile(8, { length: 240 })])).toBe(8);
    expect(estimateRounds([profile(8, { length: 60 })])).toBe(8);
  });

  it('keeps the answer inside min..max', () => {
    const n = estimateRounds([profile(9)], { min: 10, max: 14 });
    expect(n).toBeGreaterThanOrEqual(10);
    expect(n).toBeLessThanOrEqual(14);
  });

  it('can be told to look for fewer rounds', () => {
    expect(estimateRounds([profile(6, { noise: 0 })], { min: 3, max: 18 })).toBe(6);
  });

  it('returns a sensible whole number for a flat profile', () => {
    const n = estimateRounds([Array.from({ length: 100 }, () => 128)]);
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeGreaterThanOrEqual(5);
    expect(n).toBeLessThanOrEqual(18);
  });
});

describe('5.3 estimateRounds: several profiles vote together', () => {
  it('finds the waves when every sector shows them differently', () => {
    const sectors = Array.from({ length: 12 }, (_, k) => profile(9, { phase: k * 0.9, drift: 10 + k * 8, noise: 8, amplitude: 6 }));
    expect(estimateRounds(sectors)).toBe(9);
  });

  it('is not fooled when some sectors are pure junk', () => {
    const good = Array.from({ length: 8 }, (_, k) => profile(12, { phase: k }));
    const junk = Array.from({ length: 3 }, () => profile(6, { amplitude: 2, noise: 15 }));
    expect(estimateRounds([...good, ...junk])).toBe(12);
  });

  it('gives the same answer as a single profile when there is only one', () => {
    const p = profile(10);
    expect(estimateRounds([p])).toBe(estimateRounds([p, p]));
  });

  it('accepts profiles of different lengths', () => {
    expect(estimateRounds([profile(8, { length: 60 }), profile(8, { length: 120 }), profile(8, { length: 200 })])).toBe(8);
  });
});

describe('5.3 estimateRounds: bad input', () => {
  it('refuses an empty list', () => {
    expect(() => estimateRounds([])).toThrow(RangeError);
  });

  it('refuses a profile that is too short to measure', () => {
    expect(() => estimateRounds([[1, 2, 3]])).toThrow(RangeError);
    expect(() => estimateRounds([profile(9), [1, 2, 3]])).toThrow(RangeError);
  });
});
