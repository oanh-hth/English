import { useCallback, useEffect, useReducer, useState } from 'react';
import type { Item, NewItemInput } from '../domain/types';
import type { ApiClient } from './api';
import { itemsReducer } from './reducer';

export type ItemsApi = Pick<ApiClient, 'listItems' | 'addItem' | 'patchItem' | 'deleteItem'>;

export interface UseItems {
  items: Item[];
  status: 'loading' | 'ready' | 'error';
  error: string;
  add: (input: NewItemInput) => Promise<void>;
  move: (id: string, x: number, y: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/**
 * Keeps the room's items in sync with the server.
 *  - on mount: status 'loading', call api.listItems(), dispatch 'loaded', status 'ready'. If it fails: status 'error' and error = the message.
 *  - add: await api.addItem, then dispatch 'added' (not optimistic: the server decides the id and the rebuy result)
 *  - move: OPTIMISTIC. Dispatch 'moved' immediately, then api.patchItem(id, { x, y }). If the call fails, reload the list from the server and set error.
 *  - remove: optimistic as well (dispatch 'removed' first, then api.deleteItem; on failure reload and set error)
 */
export function useItems(api: ItemsApi): UseItems {
  // TODO: useReducer for the items, useState for status/error. A `reload` function shared by the
  //       first load and by the "undo" after a failed optimistic update. Guard the effect against
  //       setting state after unmount with a cancelled flag in the cleanup.
  throw new Error('Not implemented yet');
}
