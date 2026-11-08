import { compareSpending, formatVND, monthKey, totalForMonth } from '@/domain/spending';
import { day, item } from '../helpers';

describe('monthKey', () => {
  it('keeps year and month', () => {
    expect(monthKey('2026-11-08')).toBe('2026-11');
  });
});

describe('formatVND', () => {
  it('uses dots and the dong symbol', () => {
    expect(formatVND(517600).replace(/\s/g, ' ')).toBe('517.600 ₫');
    expect(formatVND(0).replace(/\s/g, ' ')).toBe('0 ₫');
  });
  it('rounds to whole dong', () => {
    expect(formatVND(1000.6).replace(/\s/g, ' ')).toBe('1.001 ₫');
  });
});

const items = [
  item({ bought: '2026-11-02', price: 100_000 }),
  item({ bought: '2026-11-07', price: 50_000, used: true }), // used items still count
  item({ bought: '2026-11-20', price: 999_000 }), // after "today": ignored by upToDay
  item({ bought: '2026-10-03', price: 80_000 }),
  item({ bought: '2026-10-09', price: 40_000 }),
  item({ bought: '2026-10-25', price: 500_000 }),
  item({ bought: '2025-11-05', price: 7_000 }),
];

describe('totalForMonth', () => {
  it('sums one month, used items included', () => {
    expect(totalForMonth(items, 2026, 10)).toBe(100_000 + 50_000 + 999_000);
  });
  it('stops at upToDay', () => {
    expect(totalForMonth(items, 2026, 10, 8)).toBe(150_000);
  });
  it('does not mix up the same month of another year', () => {
    expect(totalForMonth(items, 2025, 10)).toBe(7_000);
  });
  it('is 0 for a month without purchases', () => {
    expect(totalForMonth(items, 2026, 5)).toBe(0);
  });
});

describe('compareSpending', () => {
  it('compares this month so far with the same days of last month', () => {
    const r = compareSpending(items, day('2026-11-08'));
    expect(r.current).toBe(150_000);
    expect(r.previousSameDays).toBe(80_000);
    expect(r.previousTotal).toBe(620_000);
    expect(r.changePct).toBeCloseTo(87.5);
    expect(r.trend).toBe('up');
  });
  it('reports a decrease', () => {
    const r = compareSpending([item({ bought: '2026-11-01', price: 10 }), item({ bought: '2026-10-01', price: 40 })], day('2026-11-08'));
    expect(r.trend).toBe('down');
    expect(r.changePct).toBeCloseTo(-75);
  });
  it('is flat when the amounts are equal', () => {
    const r = compareSpending([item({ bought: '2026-11-01', price: 40 }), item({ bought: '2026-10-01', price: 40 })], day('2026-11-08'));
    expect(r.trend).toBe('flat');
    expect(r.changePct).toBeCloseTo(0);
  });
  it('has no percentage when last month had no spending', () => {
    const r = compareSpending([item({ bought: '2026-11-01', price: 40 })], day('2026-11-08'));
    expect(r.changePct).toBeNull();
    expect(r.trend).toBe('up');
  });
  it('wraps from January to December of the previous year', () => {
    const r = compareSpending([item({ bought: '2025-12-02', price: 70 }), item({ bought: '2026-01-02', price: 35 })], day('2026-01-10'));
    expect(r.previousSameDays).toBe(70);
    expect(r.current).toBe(35);
    expect(r.trend).toBe('down');
  });
  it('uses the whole of last month when it is shorter than today\'s day number', () => {
    const r = compareSpending([item({ bought: '2026-11-30', price: 90 }), item({ bought: '2026-11-15', price: 10 }), item({ bought: '2026-12-31', price: 1 })], day('2026-12-31'));
    expect(r.previousSameDays).toBe(100);
    expect(r.previousTotal).toBe(100);
  });
});
