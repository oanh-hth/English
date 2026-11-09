import type { Item } from '../domain/types';

/** Example items for the gallery, relative to `today`. Plain code: it uses none of your exercises. */
export function reducerDemo(today: Date): Item[] {
  const iso = (offset: number) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const mk = (id: string, name: string, cat: Item['cat'], boughtAgo: number, price: number, expIn: number | null, x: number, y: number): Item => ({
    id, name, cat, bought: iso(-boughtAgo), exp: expIn === null ? '' : iso(expIn), price, qty: 1, x, y, used: false,
  });
  return [
    mk('1', 'Milk 1L', 'dairy', 3, 32_000, 1, 20, 30),
    mk('2', 'Cheddar', 'dairy', 5, 52_000, -2, 40, 25),
    mk('3', 'Bananas', 'produce', 2, 23_000, 4, 65, 70),
    mk('4', 'Rice 5kg', 'pantry', 20, 180_000, 300, 80, 40),
    mk('5', 'Diapers', 'baby', 45, 420_000, null, 15, 75),
    mk('6', 'Shampoo', 'care', 35, 95_000, 400, 50, 55),
  ];
}
