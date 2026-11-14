import { describe, expect, it } from 'vitest';
import { addPoints, isThirsty, NEED, plantSeed, stageOf, weekStrip } from '../src/growth';

describe('stageOf', () => {
  it('names the stages', () => {
    expect(stageOf(0, 600).label).toBe('Seed'); expect(stageOf(60, 600).label).toBe('Sprout'); expect(stageOf(200, 600).label).toBe('Seedling');
    expect(stageOf(400, 600).label).toBe('Growing'); expect(stageOf(500, 600).label).toBe('Budding'); expect(stageOf(600, 600).label).toBe('Ready to harvest');
  });
  it('clamps t between 0 and 1', () => { expect(stageOf(900, 600).t).toBe(1); expect(stageOf(-5, 600).t).toBe(0); expect(stageOf(300, 600).t).toBe(0.5); });
  it('stage boundaries: 8% and 25%', () => { expect(stageOf(47, 600).index).toBe(0); expect(stageOf(48, 600).index).toBe(1); expect(stageOf(149, 600).index).toBe(1); expect(stageOf(150, 600).index).toBe(2); });
});
describe('addPoints', () => {
  it('grows the plant', () => expect(addPoints({ growth: 100, bank: 0 }, 50, 600)).toEqual({ garden: { growth: 150, bank: 0 }, becameRipe: false }));
  it('banks everything when there is no plant', () => expect(addPoints({ growth: null, bank: 10 }, 20, 600)).toEqual({ garden: { growth: null, bank: 30 }, becameRipe: false }));
  it('caps at need and banks the overflow, ripe exactly once', () => {
    const r = addPoints({ growth: 590, bank: 5 }, 30, 600); expect(r).toEqual({ garden: { growth: 600, bank: 25 }, becameRipe: true });
    expect(addPoints(r.garden, 10, 600)).toEqual({ garden: { growth: 600, bank: 35 }, becameRipe: false });
  });
  it('ignores zero or negative points', () => { const g = { growth: 10, bank: 0 }; expect(addPoints(g, 0, 600).garden).toEqual(g); expect(addPoints(g, -4, 600).garden).toEqual(g); });
});
describe('plantSeed', () => {
  it('pours the bank into the new plant', () => expect(plantSeed(130, NEED.chilli)).toEqual({ growth: 130, bank: 0 }));
  it('keeps what does not fit', () => expect(plantSeed(500, NEED.chilli)).toEqual({ growth: 450, bank: 50 }));
});
describe('isThirsty', () => {
  it('after 3 days', () => { expect(isThirsty('2026-11-11', '2026-11-14')).toBe(true); expect(isThirsty('2026-11-12', '2026-11-14')).toBe(false); expect(isThirsty('2026-11-14', '2026-11-14')).toBe(false); });
  it('never watered', () => expect(isThirsty(null, '2026-11-14')).toBe(true));
});
describe('weekStrip', () => {
  it('7 days, oldest first, today last', () => expect(weekStrip(['2026-11-14', '2026-11-12', '2026-11-01'], '2026-11-14')).toEqual([false, false, false, false, true, false, true]));
  it('works across a month end', () => expect(weekStrip(['2026-10-31'], '2026-11-02')).toEqual([false, false, false, false, true, false, false]));
});
