import type { Item } from '@/domain/types';

/** A local-midnight Date from 'YYYY-MM-DD' (written by hand so it does not depend on the code you are writing). */
export function day(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
}

/** The "today" used by most tests. */
export const TODAY = day('2026-11-08');

let counter = 0;
/** Build an Item with sensible defaults; override what the test cares about. */
export function item(overrides: Partial<Item> = {}): Item {
  counter += 1;
  return {
    id: `i${counter}`,
    name: 'Thing',
    cat: 'pantry',
    bought: '2026-11-01',
    exp: '',
    price: 10_000,
    qty: 1,
    x: 50,
    y: 60,
    used: false,
    ...overrides,
  };
}
