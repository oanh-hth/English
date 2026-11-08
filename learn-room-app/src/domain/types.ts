/**
 * The vocabulary of the whole app: what an item is and which categories exist.
 * Everything else in the course builds on these types.
 */

export const CATEGORY_IDS = [
  'produce', 'dairy', 'drinks', 'pantry', 'meds', 'care', 'cleaning', 'electronics',
  'baby', 'clothes', 'gift', 'tools', 'stationery', 'yarn', 'snack', 'other',
] as const;

/** A union of string literals derived from the array above: 'produce' | 'dairy' | ... */
export type CategoryId = (typeof CATEGORY_IDS)[number];

export interface CategoryInfo {
  readonly id: CategoryId;
  readonly name: string;
  readonly color: string;
}

export const CATEGORIES: readonly CategoryInfo[] = [
  { id: 'produce', name: 'Fresh produce', color: '#ff5a47' },
  { id: 'dairy', name: 'Dairy & eggs', color: '#3d9bff' },
  { id: 'drinks', name: 'Drinks', color: '#ff9a1f' },
  { id: 'pantry', name: 'Pantry', color: '#bd8c4a' },
  { id: 'meds', name: 'Medicine', color: '#1fbf8a' },
  { id: 'care', name: 'Personal care & cosmetics', color: '#c76bf0' },
  { id: 'cleaning', name: 'Cleaning', color: '#19c3e0' },
  { id: 'electronics', name: 'Electronics', color: '#6f86ad' },
  { id: 'baby', name: 'Baby', color: '#ff6f9f' },
  { id: 'clothes', name: 'Clothes', color: '#5b6ee1' },
  { id: 'gift', name: 'Gifts', color: '#f2b705' },
  { id: 'tools', name: 'Tools', color: '#f76707' },
  { id: 'stationery', name: 'Stationery', color: '#74b816' },
  { id: 'yarn', name: 'Yarn', color: '#7950f2' },
  { id: 'snack', name: 'Snacks', color: '#e64980' },
  { id: 'other', name: 'Other', color: '#c4925f' },
];

/** Dates are plain strings in the data model: 'YYYY-MM-DD' (no time zone surprises). */
export type ISODate = string;

export interface Item {
  id: string;
  name: string;
  cat: CategoryId;
  /** Day it was bought. Spending is grouped by this. */
  bought: ISODate;
  /** Expiry date, or '' when the item does not expire. */
  exp: ISODate;
  /** Price for the WHOLE line (qty items together), in VND. */
  price: number;
  qty: number;
  /** Position in the room, 0-100 (percent of width / height). */
  x: number;
  y: number;
  /** Used up or replaced: gone from the room but still counted in spending. */
  used: boolean;
  note?: string;
  /** Last time the user pressed "just used". */
  touched?: ISODate;
  /** Last time the user said "not used yet" to a question. */
  snoozed?: ISODate;
  usedAt?: ISODate;
  replacedBy?: string;
  /** Items that came from the same bill share a batch id. */
  batch?: string;
}

/** What the "add item" form collects. Only name and category are required. */
export interface NewItemInput {
  name: string;
  cat: CategoryId;
  exp?: ISODate;
  price?: number;
  qty?: number;
  bought?: ISODate;
}

/** Type guard: narrows `unknown` to CategoryId. */
export function isCategoryId(value: unknown): value is CategoryId {
  // TODO: Return true only when value is a string that appears in CATEGORY_IDS. Think about why
  //       `value: unknown` forces you to check typeof first.
  throw new Error('Not implemented yet');
}

/** Look a category up by id. */
export function categoryInfo(id: CategoryId): CategoryInfo {
  // TODO: Find the entry in CATEGORIES with this id. It must always exist; throw an Error if it
  //       does not (that would be a programmer mistake).
  throw new Error('Not implemented yet');
}

/**
 * Turn form input into a complete Item.
 * Defaults: bought = ctx.today, exp = '', price = 0, qty = 1, x = 50, y = 60, used = false.
 * Rules: the name is trimmed and must not be empty; price must be a number >= 0;
 * qty must be an integer >= 1; exp (when given and not '') must look like YYYY-MM-DD.
 * Invalid input throws an Error with a helpful message.
 */
export function makeItem(input: NewItemInput, ctx: { id: string; today: ISODate }): Item {
  // TODO: Validate first (name, price, qty, exp), then build the object with the defaults from the
  //       comment above.
  throw new Error('Not implemented yet');
}
