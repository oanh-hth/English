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
  // @solution-start Hooks first (useItems, useState), THEN the early returns. Keep `selectedId` and `addError` as local state; derive everything else (spending, selected item) while rendering.
  const { items, status, error, add, move, remove } = useItems(api);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addError, setAddError] = useState('');

  if (status === 'loading') return <p>Loading your room…</p>;
  if (status === 'error') return <p role="alert">{error}</p>;

  const selected = items.find((i) => i.id === selectedId);
  const parseBill = api.parseBill;

  async function addRows(rows: BillRow[]) {
    try {
      setAddError('');
      for (const row of rows) {
        await add({ name: row.name, cat: row.cat, price: row.price, qty: row.qty, bought: row.bought, ...(row.exp ? { exp: row.exp } : {}) });
      }
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Could not add the items');
    }
  }

  return (
    <main>
      <h1>Phòng Trữ Đồ</h1>
      <Mascots items={items} today={today} />
      <SpendingCard spending={compareSpending(items, today)} />
      <ExpiringList items={items} today={today} onUse={(id) => void remove(id)} />
      <Room items={items} selectedId={selectedId} onSelect={setSelectedId} onMove={(id, x, y) => void move(id, x, y)} />
      {selected && (
        <>
          <p>Selected: {selected.name}</p>
          <button
            type="button"
            onClick={() => {
              void remove(selected.id);
              setSelectedId(null);
            }}
          >
            Delete {selected.name}
          </button>
        </>
      )}
      <ItemForm
        onSubmit={async (input) => {
          try {
            setAddError('');
            await add(input);
          } catch (e) {
            setAddError(e instanceof Error ? e.message : 'Could not add the item');
          }
        }}
      />
      {parseBill && <BillImport parse={parseBill} onAdd={addRows} />}
      {addError && <p role="alert">{addError}</p>}
    </main>
  );
  // @solution-end
}
