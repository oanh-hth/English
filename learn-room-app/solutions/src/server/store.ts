import type { Item } from '../domain/types';

/** Fields a client may change after an item exists. */
export type ItemPatch = Partial<Pick<Item, 'x' | 'y' | 'used' | 'usedAt' | 'touched' | 'snoozed' | 'note'>>;

/**
 * Keeps the items in memory. Callers get COPIES, so nobody can change the store's data by accident.
 * `onChange` is called with the full list after every change (the file store uses it to save).
 */
export class ItemStore {
  private items: Item[];

  constructor(
    initial: readonly Item[] = [],
    private readonly onChange: (items: Item[]) => void = () => {},
  ) {
    // @solution-start Copy each item with spread so later changes to `initial` cannot leak in.
    // @stub this.items = [];
    this.items = initial.map((i) => ({ ...i }));
    // @solution-end
  }

  /** All items, oldest first. */
  list(): Item[] {
    // @solution-start Return copies of the items.
    return this.items.map((i) => ({ ...i }));
    // @solution-end
  }

  get(id: string): Item | undefined {
    // @solution-start find + copy. Return undefined when the id is unknown.
    const found = this.items.find((i) => i.id === id);
    return found ? { ...found } : undefined;
    // @solution-end
  }

  /** Append an item and notify. Returns a copy. */
  add(item: Item): Item {
    // @solution-start push a copy, call this.emit(), return a copy.
    this.items.push({ ...item });
    this.emit();
    return { ...item };
    // @solution-end
  }

  /** Replace the whole list (used by the rebuy rule). Notifies once. */
  replaceAll(items: readonly Item[]): void {
    // @solution-start Replace this.items with copies and notify once.
    this.items = items.map((i) => ({ ...i }));
    this.emit();
    // @solution-end
  }

  /** Merge `patch` into the item. Undefined values in the patch are ignored. Unknown id: return undefined and do NOT notify. */
  update(id: string, patch: ItemPatch): Item | undefined {
    // @solution-start Find the index, build the merged object, skipping keys whose value is undefined, store it, notify, return a copy.
    const index = this.items.findIndex((i) => i.id === id);
    if (index < 0) return undefined;
    const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
    const merged = { ...(this.items[index] as Item), ...clean } as Item;
    this.items[index] = merged;
    this.emit();
    return { ...merged };
    // @solution-end
  }

  /** Delete an item. Returns true when something was removed. Unknown id: false and no notification. */
  remove(id: string): boolean {
    // @solution-start filter and compare the lengths.
    const before = this.items.length;
    this.items = this.items.filter((i) => i.id !== id);
    if (this.items.length === before) return false;
    this.emit();
    return true;
    // @solution-end
  }

  private emit(): void {
    this.onChange(this.list());
  }
}
