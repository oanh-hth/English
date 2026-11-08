import type { Item } from '../domain/types';

export type ItemsAction =
  | { type: 'loaded'; items: Item[] }
  | { type: 'added'; item: Item; replacedIds: string[] }
  | { type: 'moved'; id: string; x: number; y: number }
  | { type: 'removed'; id: string };

/**
 * The state of the room. A reducer is a PURE function: (state, action) => new state. Never mutate `state`.
 *  loaded  -> replace everything with action.items
 *  added   -> append action.item; every item whose id is in replacedIds becomes a copy with used: true, replacedBy: item.id
 *  moved   -> the item with that id gets the new x and y (clamped to 0..100); unknown id: return the SAME state array
 *  removed -> drop the item
 */
export function itemsReducer(state: readonly Item[], action: ItemsAction): Item[] {
  // TODO: A switch on action.type. TypeScript narrows `action` inside every case, so action.item
  //       only exists in 'added'. Unchanged items must keep the same object (reference) so React
  //       can skip re-rendering them.
  throw new Error('Not implemented yet');
}
