import { expiryStatus, needsAttention, whenText } from '@/domain/expiry';
import { item, TODAY } from '../helpers';

describe('expiryStatus', () => {
  it('none without a date', () => {
    expect(expiryStatus(item(), TODAY)).toBe('none');
  });
  it('expired when the date has passed', () => {
    expect(expiryStatus(item({ exp: '2026-11-07' }), TODAY)).toBe('expired');
  });
  it('soon from today up to the window (inclusive)', () => {
    expect(expiryStatus(item({ exp: '2026-11-08' }), TODAY)).toBe('soon');
    expect(expiryStatus(item({ exp: '2026-11-11' }), TODAY)).toBe('soon');
  });
  it('ok beyond the window', () => {
    expect(expiryStatus(item({ exp: '2026-11-12' }), TODAY)).toBe('ok');
  });
  it('respects a custom window', () => {
    expect(expiryStatus(item({ exp: '2026-11-12' }), TODAY, 7)).toBe('soon');
    expect(expiryStatus(item({ exp: '2026-11-09' }), TODAY, 0)).toBe('ok');
  });
});

describe('whenText', () => {
  it.each([
    [-3, 'Expired 3 days ago'],
    [-1, 'Expired 1 day ago'],
    [0, 'Expires today'],
    [1, 'Expires tomorrow'],
    [5, 'Expires in 5 days'],
  ])('%i -> %s', (days, text) => {
    expect(whenText(days)).toBe(text);
  });
});

describe('needsAttention', () => {
  const milk = item({ name: 'Milk', exp: '2026-11-09' });
  const yogurt = item({ name: 'Yogurt', exp: '2026-11-05' });
  const rice = item({ name: 'Rice', exp: '2027-01-01' });
  const salt = item({ name: 'Salt' });
  const eggs = item({ name: 'Eggs', exp: '2026-11-09' });
  const oldCream = item({ name: 'Cream', exp: '2026-11-01', used: true });

  it('keeps expired and soon items, drops the rest and the used ones', () => {
    expect(needsAttention([milk, rice, salt, yogurt, oldCream], TODAY).map((i) => i.name)).toEqual(['Yogurt', 'Milk']);
  });
  it('sorts most urgent first and keeps the original order for ties', () => {
    expect(needsAttention([eggs, milk, yogurt], TODAY).map((i) => i.name)).toEqual(['Yogurt', 'Eggs', 'Milk']);
  });
  it('does not change the array it receives', () => {
    const input = [milk, yogurt];
    needsAttention(input, TODAY);
    expect(input.map((i) => i.name)).toEqual(['Milk', 'Yogurt']);
  });
  it('uses the window argument', () => {
    expect(needsAttention([rice], TODAY, 100_000)).toHaveLength(1);
  });
});
