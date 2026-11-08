import type { ReactElement } from 'react';
import { categoryInfo, type Item } from '../domain/types';

interface Props {
  items: readonly Item[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

/**
 * The room: a positioned box with one button per item that is still in the room (not `used`).
 *  - the container has role="group" and aria-label="Room"
 *  - every item is a <button> whose accessible name is "<name> (<category name>)",
 *    placed with style left: `${x}%` and top: `${y}%` (position: absolute)
 *  - the selected item has aria-pressed="true", the others "false"
 *  - clicking calls onSelect(item.id)
 *  - when the room is empty show the paragraph "The room is empty. Add your first item!"
 */
export function Room({ items, selectedId = null, onSelect }: Props): ReactElement {
  // @solution-start filter first, then map. Use categoryInfo(item.cat).name for the label and the category colour for the background.
  const inRoom = items.filter((i) => !i.used);
  return (
    <div role="group" aria-label="Room" style={{ position: 'relative', minHeight: 320 }}>
      {inRoom.length === 0 && <p>The room is empty. Add your first item!</p>}
      {inRoom.map((item) => {
        const info = categoryInfo(item.cat);
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === selectedId}
            onClick={() => onSelect?.(item.id)}
            style={{ position: 'absolute', left: `${item.x}%`, top: `${item.y}%`, background: info.color }}
          >
            {`${item.name} (${info.name})`}
          </button>
        );
      })}
    </div>
  );
  // @solution-end
}
