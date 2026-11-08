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
    // TODO: Copy each item with spread so later changes to `initial` cannot leak in.
    this.items = [];
  }

  /** All items, oldest first. */
  list(): Item[] {
    // TODO: Return copies of the items.
    throw new Error('Not implemented yet');
  }

  get(id: string): Item | undefined {
    // TODO: find + copy. Return undefined when the id is unknown.
    throw new Error('Not implemented yet');
  }

  /** Append an item and notify. Returns a copy. */
  add(item: Item): Item {
    // TODO: push a copy, call this.emit(), return a copy.
    throw new Error('Not implemented yet');
  }

  /** Replace the whole list (used by the rebuy rule). Notifies once. */
  replaceAll(items: readonly Item[]): void {
    // TODO: Replace this.items with copies and notify once.
    throw new Error('Not implemented yet');
  }

  /** Merge `patch` into the item. Undefined values in the patch are ignored. Unknown id: return undefined and do NOT notify. */
  update(id: string, patch: ItemPatch): Item | undefined {
    // TODO: Find the index, build the merged object, skipping keys whose value is undefined, store
    //       it, notify, return a copy.
    throw new Error('Not implemented yet');
  }

  /** Delete an item. Returns true when something was removed. Unknown id: false and no notification. */
  remove(id: string): boolean {
    // TODO: filter and compare the lengths.
    throw new Error('Not implemented yet');
  }

  private emit(): void {
    this.onChange(this.list());
  }
}
