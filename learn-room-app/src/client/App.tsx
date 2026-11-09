import { useState, type ReactElement } from 'react';
import type { BillRow } from '../domain/billTypes';
import { compareSpending } from '../domain/spending';
import type { ApiClient } from './api';
import { BillImport } from './BillImport';
import { ExpiringList } from './ExpiringList';
import { ItemForm } from './ItemForm';
import { Mascots } from './Mascots';
import { Room } from './Room';
import { SpendingCard } from './SpendingCard';
import { useItems, type ItemsApi } from './useItems';

interface Props {
  /** `parseBill` is optional: without it the bill import panel is not shown. */
  api: ItemsApi & Partial<Pick<ApiClient, 'parseBill'>>;
  today: Date;
}

/**
 * The whole screen.
 *
 * Part 7 (the core):
 *  - while loading show "Loading your room…"; when the load failed show an element with role="alert" containing the error
 *  - otherwise: <main> with <h1>Phòng Trữ Đồ</h1>, SpendingCard (spending computed locally with compareSpending),
 *    ExpiringList (its "Used <name>" buttons call remove(id) to keep the exercise small),
 *    Room (clicking an item selects it; the selected item's name is shown in a paragraph "Selected: <name>"), and the ItemForm which calls `add`
 *  - a failed add shows its message in role="alert"
 *
 * Part 8 (finishing touches, extend your App):
 *  - <Mascots> at the top, right after the heading
 *  - the Room gets onMove={move}, so dragging saves the new position
 *  - when an item is selected, a button "Delete <name>" removes it (remove) and clears the selection
 *  - when api.parseBill exists, show <BillImport>: parse = api.parseBill, and onAdd adds every row one by one
 *    with `add` ({ name, cat, price, qty, bought, exp when not empty }). A failure shows its message in role="alert".
 */
export function App({ api, today }: Props): ReactElement {
  // TODO: Hooks first (useItems, useState), THEN the early returns. Keep `selectedId` and
  //       `addError` as local state; derive everything else (spending, selected item) while
  //       rendering.
  throw new Error('Not implemented yet');
}
