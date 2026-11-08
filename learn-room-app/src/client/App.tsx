import { useState, type ReactElement } from 'react';
import { compareSpending } from '../domain/spending';
import type { ApiClient } from './api';
import { ExpiringList } from './ExpiringList';
import { ItemForm } from './ItemForm';
import { Room } from './Room';
import { SpendingCard } from './SpendingCard';
import { useItems } from './useItems';

interface Props {
  api: Pick<ApiClient, 'listItems' | 'addItem' | 'patchItem' | 'deleteItem'>;
  today: Date;
}

/**
 * Put everything together.
 *  - while loading show "Loading your room…"; when the load failed show an element with role="alert" containing the error
 *  - otherwise: <h1>Phòng Trữ Đồ</h1>, SpendingCard (spending computed locally with compareSpending),
 *    ExpiringList (its "Used <name>" buttons call remove(id) to keep the exercise small),
 *    Room (clicking an item selects it; the selected item's name is shown in a paragraph "Selected: <name>"), and the ItemForm which calls `add`
 *  - a failed add shows its message in role="alert"
 */
export function App({ api, today }: Props): ReactElement {
  // TODO: The hook gives you items + actions. Keep `selectedId` and `addError` as local state.
  //       Derive everything else (spending, selected item) while rendering.
  throw new Error('Not implemented yet');
}
