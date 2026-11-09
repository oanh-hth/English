import { addDays, daysBetween, daysLeft, parseISO, startOfDay, toISO } from '@/domain/dates';
import { day, item, TODAY } from '../helpers';

describe('parseISO', () => {
  it('builds a local date', () => {
    const d = parseISO('2026-11-08');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 10, 8, 0]);
  });
  it('accepts a leap day only in leap years', () => {
    expect(parseISO('2028-02-29').getDate()).toBe(29);
    expect(() => parseISO('2026-02-29')).toThrow('Invalid date: 2026-02-29');
  });
  it('rejects dates that roll over and badly shaped text', () => {
    expect(() => parseISO('2026-04-31')).toThrow('Invalid date');
    expect(() => parseISO('2026-13-01')).toThrow('Invalid date');
    expect(() => parseISO('8/11/2026')).toThrow('Invalid date: 8/11/2026');
    expect(() => parseISO('')).toThrow('Invalid date');
  });
});

describe('toISO', () => {
  it('pads month and day', () => {
    expect(toISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
  it('uses local time, not UTC, even just after midnight', () => {
    expect(toISO(new Date(2026, 10, 8, 0, 30))).toBe('2026-11-08');
    expect(toISO(new Date(2026, 10, 8, 23, 59))).toBe('2026-11-08');
  });
  it('round-trips with parseISO', () => {
    expect(toISO(parseISO('2026-12-31'))).toBe('2026-12-31');
  });
});

describe('startOfDay', () => {
  it('drops the time and does not change the input', () => {
    const input = new Date(2026, 10, 8, 15, 45, 10);
    const result = startOfDay(input);
    expect([result.getHours(), result.getMinutes(), result.getDate()]).toEqual([0, 0, 8]);
    expect(input.getHours()).toBe(15);
    expect(result).not.toBe(input);
  });
});

describe('addDays', () => {
  it('adds and subtracts across month and year ends', () => {
    expect(toISO(addDays(day('2026-11-28'), 5))).toBe('2026-12-03');
    expect(toISO(addDays(day('2026-01-02'), -3))).toBe('2025-12-30');
    expect(toISO(addDays(day('2028-02-28'), 1))).toBe('2028-02-29');
  });
  it('does not mutate its argument', () => {
    const input = day('2026-11-08');
    addDays(input, 10);
    expect(toISO(input)).toBe('2026-11-08');
  });
});

describe('daysBetween', () => {
  it('counts whole days in both directions', () => {
    expect(daysBetween(day('2026-11-08'), day('2026-11-11'))).toBe(3);
    expect(daysBetween(day('2026-11-11'), day('2026-11-08'))).toBe(-3);
    expect(daysBetween(day('2026-11-08'), day('2026-11-08'))).toBe(0);
  });
  it('ignores the time of day', () => {
    expect(daysBetween(new Date(2026, 10, 8, 23, 0), new Date(2026, 10, 9, 1, 0))).toBe(1);
  });
  it('is not fooled by daylight saving changes', () => {
    expect(daysBetween(day('2026-03-01'), day('2026-04-01'))).toBe(31);
    expect(daysBetween(day('2026-10-01'), day('2026-11-15'))).toBe(45);
  });
});

describe('daysLeft', () => {
  it('is null without an expiry date', () => {
    expect(daysLeft(item({ exp: '' }), TODAY)).toBeNull();
  });
  it('is 0 on the day itself, positive before and negative after', () => {
    expect(daysLeft(item({ exp: '2026-11-08' }), TODAY)).toBe(0);
    expect(daysLeft(item({ exp: '2026-11-13' }), TODAY)).toBe(5);
    expect(daysLeft(item({ exp: '2026-11-05' }), TODAY)).toBe(-3);
  });
});
