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
  // @solution-start The hook gives you items + actions. Keep `selectedId` and `addError` as local state. Derive everything else (spending, selected item) while rendering.
  const { items, status, error, add, remove } = useItems(api);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addError, setAddError] = useState('');

  if (status === 'loading') return <p>Loading your room…</p>;
  if (status === 'error') return <p role="alert">{error}</p>;

  const selected = items.find((i) => i.id === selectedId);
  return (
    <main>
      <h1>Phòng Trữ Đồ</h1>
      <SpendingCard spending={compareSpending(items, today)} />
      <ExpiringList items={items} today={today} onUse={(id) => void remove(id)} />
      <Room items={items} selectedId={selectedId} onSelect={setSelectedId} />
      {selected && <p>Selected: {selected.name}</p>}
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
      {addError && <p role="alert">{addError}</p>}
    </main>
  );
  // @solution-end
}
