import { categoryInfo, isCategoryId, makeItem } from '@/domain/types';

describe('isCategoryId', () => {
  it('accepts real category ids', () => {
    expect(isCategoryId('dairy')).toBe(true);
    expect(isCategoryId('yarn')).toBe(true);
  });
  it('rejects unknown strings and non-strings', () => {
    expect(isCategoryId('Dairy')).toBe(false);
    expect(isCategoryId('toys')).toBe(false);
    expect(isCategoryId(42)).toBe(false);
    expect(isCategoryId(null)).toBe(false);
    expect(isCategoryId(undefined)).toBe(false);
  });
});

describe('categoryInfo', () => {
  it('returns the entry for an id', () => {
    expect(categoryInfo('drinks')).toMatchObject({ id: 'drinks', name: 'Drinks' });
  });
  it('throws for an id that does not exist', () => {
    // @ts-expect-error on purpose: a value the type system would normally stop
    expect(() => categoryInfo('nope')).toThrow();
  });
});

describe('makeItem', () => {
  const ctx = { id: 'abc', today: '2026-11-08' };

  it('fills in the defaults', () => {
    expect(makeItem({ name: 'Milk', cat: 'dairy' }, ctx)).toEqual({
      id: 'abc', name: 'Milk', cat: 'dairy', bought: '2026-11-08', exp: '',
      price: 0, qty: 1, x: 50, y: 60, used: false,
    });
  });

  it('keeps the values that were given', () => {
    const it = makeItem({ name: 'Eggs', cat: 'dairy', exp: '2026-11-20', price: 45000, qty: 2, bought: '2026-11-05' }, ctx);
    expect(it).toMatchObject({ exp: '2026-11-20', price: 45000, qty: 2, bought: '2026-11-05' });
  });

  it('trims the name', () => {
    expect(makeItem({ name: '  Rice  ', cat: 'pantry' }, ctx).name).toBe('Rice');
  });

  it('rejects an empty name', () => {
    expect(() => makeItem({ name: '   ', cat: 'pantry' }, ctx)).toThrow('Item name is required');
  });

  it('rejects a negative or non-numeric price', () => {
    expect(() => makeItem({ name: 'x', cat: 'pantry', price: -1 }, ctx)).toThrow('Price must be a non-negative number');
    expect(() => makeItem({ name: 'x', cat: 'pantry', price: Number.NaN }, ctx)).toThrow('Price');
  });

  it('allows a price of 0', () => {
    expect(makeItem({ name: 'Free sample', cat: 'snack', price: 0 }, ctx).price).toBe(0);
  });

  it('rejects a quantity that is not a whole number >= 1', () => {
    for (const qty of [0, -2, 1.5]) {
      expect(() => makeItem({ name: 'x', cat: 'pantry', qty }, ctx)).toThrow('Quantity must be a whole number of at least 1');
    }
  });

  it('rejects an expiry that is not YYYY-MM-DD', () => {
    expect(() => makeItem({ name: 'x', cat: 'pantry', exp: '12/11/2026' }, ctx)).toThrow('Expiry must look like YYYY-MM-DD');
  });
});
