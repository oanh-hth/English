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
  // @solution-start A switch on action.type. TypeScript narrows `action` inside every case, so action.item only exists in 'added'. Unchanged items must keep the same object (reference) so React can skip re-rendering them.
  switch (action.type) {
    case 'loaded':
      return [...action.items];
    case 'added': {
      const replaced = new Set(action.replacedIds);
      const updated = state.map((i) => (replaced.has(i.id) ? { ...i, used: true, replacedBy: action.item.id } : i));
      return [...updated, action.item];
    }
    case 'moved': {
      if (!state.some((i) => i.id === action.id)) return state as Item[];
      const clamp = (n: number) => Math.min(100, Math.max(0, n));
      return state.map((i) => (i.id === action.id ? { ...i, x: clamp(action.x), y: clamp(action.y) } : i));
    }
    case 'removed':
      return state.filter((i) => i.id !== action.id);
  }
  // @solution-end
}
