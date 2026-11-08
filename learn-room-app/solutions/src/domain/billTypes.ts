import type { CategoryId, ISODate } from './types';

/** One line found on a bill, before the user confirms it and it becomes an Item. */
export interface BillRow {
  name: string;
  cat: CategoryId;
  exp: ISODate;
  /** Total price of the line (all `qty` together). */
  price: number;
  qty: number;
  bought: ISODate;
  note?: string;
}

/** Decides a category for a product name. Parsers take it as a parameter so tests can pass a fake. */
export type Guess = (name: string) => CategoryId;

export type BillFormat = 'dine-in' | 'shopee' | 'receipt';
