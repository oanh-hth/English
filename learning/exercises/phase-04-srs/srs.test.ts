import { describe, it, expect } from 'vitest';
import { DAY, MINUTE, newCard, nextState, dueIds, intervalLabel, type CardState } from './srs';

const NOW = 1_700_000_000_000;
const card = (over: Partial<CardState> = {}): CardState => ({ ...newCard(NOW), ...over });

describe('newCard', () => {
  it('starts easy-going and due immediately', () => {
    expect(newCard(NOW)).toEqual({ ease: 2.5, int: 0, reps: 0, due: NOW, lapses: 0 });
  });
});

describe('nextState: Again', () => {
  it('returns in 10 minutes and resets progress', () => {
    const s = nextState(card({ reps: 4, int: 20 }), 0, NOW);
    expect(s.due).toBe(NOW + 10 * MINUTE);
    expect(s.reps).toBe(0);
    expect(s.int).toBe(0);
    expect(s.lapses).toBe(1);
    expect(s.ease).toBeCloseTo(2.3);
  });
  it('never lets ease drop below 1.3', () => {
    expect(nextState(card({ ease: 1.35 }), 0, NOW).ease).toBeCloseTo(1.3);
  });
});

describe('nextState: Good', () => {
  it('first review = 1 day, second = 3 days', () => {
    const a = nextState(card(), 2, NOW);
    expect(a.int).toBe(1); expect(a.reps).toBe(1); expect(a.due).toBe(NOW + DAY);
    const b = nextState(a, 2, NOW);
    expect(b.int).toBe(3); expect(b.reps).toBe(2);
  });
  it('then multiplies by ease and rounds', () => {
    const s = nextState(card({ reps: 2, int: 3 }), 2, NOW);
    expect(s.int).toBe(8); // round(3 * 2.5)
    expect(s.due).toBe(NOW + 8 * DAY);
  });
});

describe('nextState: Hard and Easy', () => {
  it('Hard grows slowly (x1.2, at least 1 day) and lowers ease by 0.15', () => {
    const s = nextState(card({ reps: 2, int: 10 }), 1, NOW);
    expect(s.int).toBe(12);
    expect(s.ease).toBeCloseTo(2.35);
    expect(nextState(card(), 1, NOW).int).toBe(1);
  });
  it('Easy jumps ahead (4 days, then 7) and raises ease by 0.15', () => {
    const a = nextState(card(), 3, NOW);
    expect(a.int).toBe(4); expect(a.ease).toBeCloseTo(2.65);
    expect(nextState(a, 3, NOW).int).toBe(7);
  });
  it('Easy later multiplies by ease x 1.3', () => {
    expect(nextState(card({ reps: 2, int: 10 }), 3, NOW).int).toBe(33); // round(10*2.5*1.3)
  });
});

describe('purity', () => {
  it('does not mutate the input card', () => {
    const c = card({ reps: 2, int: 3 }); const copy = { ...c };
    nextState(c, 2, NOW);
    expect(c).toEqual(copy);
  });
});

describe('dueIds', () => {
  it('lists due cards, oldest first, ignoring future ones', () => {
    const cards = { a: card({ due: NOW - 5 }), b: card({ due: NOW + 1 }), c: card({ due: NOW - 50 }), d: card({ due: NOW }) };
    expect(dueIds(cards, NOW)).toEqual(['c', 'a', 'd']);
  });
});

describe('intervalLabel', () => {
  it('formats minutes, days, months and years', () => {
    expect(intervalLabel(card(), 0)).toBe('10 min');
    expect(intervalLabel(card(), 2)).toBe('1d');
    expect(intervalLabel(card(), 3)).toBe('4d');
    expect(intervalLabel(card({ reps: 5, int: 40 }), 2)).toBe('3mo'); // 100 days
    expect(intervalLabel(card({ reps: 5, int: 200 }), 2)).toBe('1.4y'); // 500 days
  });
});
