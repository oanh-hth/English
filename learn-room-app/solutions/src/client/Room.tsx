import { useRef, useState, type PointerEvent, type ReactElement } from 'react';
import { categoryInfo, type Item } from '../domain/types';
import { pointToPercent } from './drag';

interface Props {
  items: readonly Item[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Called once when the user drops an item somewhere new (percentages 0-100). */
  onMove?: (id: string, x: number, y: number) => void;
}

/**
 * The room: a positioned box with one button per item that is still in the room (not `used`).
 *
 * Part 5 (display):
 *  - the container has role="group" and aria-label="Room"
 *  - every item is a <button> whose accessible name is "<name> (<category name>)",
 *    placed with style left: `${x}%` and top: `${y}%` (position: absolute)
 *  - the selected item has aria-pressed="true", the others "false"
 *  - clicking calls onSelect(item.id)
 *  - when the room is empty show the paragraph "The room is empty. Add your first item!"
 *
 * Part 6 (dragging, added later with onMove):
 *  - pressing the pointer on an item starts a drag; moving the pointer over the room moves the item
 *    (while dragging it is drawn at pointToPercent(clientX, clientY, room box))
 *  - releasing calls onMove(id, x, y) ONCE, but only if the pointer moved at least once
 *  - a drag must not count as a click: onSelect is not called after a drag
 *  - pointercancel ends the drag without calling onMove
 */
export function Room({ items, selectedId = null, onSelect, onMove }: Props): ReactElement {
  // @solution-start Display first (filter, map, categoryInfo). For dragging keep `drag` state { id, x, y } plus a ref that remembers whether the pointer moved. Put onPointerMove / onPointerUp / onPointerCancel on the container so a fast pointer that leaves the button still works.
  const roomRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const moved = useRef(false);
  const suppressClick = useRef(false);

  const inRoom = items.filter((i) => !i.used);

  function positionFromEvent(e: PointerEvent): { x: number; y: number } {
    const rect = roomRef.current?.getBoundingClientRect();
    return pointToPercent(e.clientX, e.clientY, {
      left: rect?.left ?? 0,
      top: rect?.top ?? 0,
      width: rect?.width ?? 0,
      height: rect?.height ?? 0,
    });
  }

  function handleMove(e: PointerEvent) {
    if (!drag) return;
    moved.current = true;
    setDrag({ id: drag.id, ...positionFromEvent(e) });
  }

  function handleUp(e: PointerEvent) {
    if (!drag) return;
    if (moved.current) {
      const { x, y } = positionFromEvent(e);
      suppressClick.current = true;
      onMove?.(drag.id, x, y);
    }
    moved.current = false;
    setDrag(null);
  }

  function handleCancel() {
    moved.current = false;
    setDrag(null);
  }

  return (
    <div
      ref={roomRef}
      role="group"
      aria-label="Room"
      style={{ position: 'relative', minHeight: 320, touchAction: 'none' }}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleCancel}
    >
      {inRoom.length === 0 && <p>The room is empty. Add your first item!</p>}
      {inRoom.map((item) => {
        const info = categoryInfo(item.cat);
        const x = drag?.id === item.id ? drag.x : item.x;
        const y = drag?.id === item.id ? drag.y : item.y;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === selectedId}
            onPointerDown={(e) => {
              if (!onMove) return;
              moved.current = false;
              suppressClick.current = false;
              (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
              setDrag({ id: item.id, x: item.x, y: item.y });
            }}
            onClick={() => {
              if (suppressClick.current) {
                suppressClick.current = false;
                return;
              }
              onSelect?.(item.id);
            }}
            style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, background: info.color, cursor: onMove ? 'grab' : undefined }}
          >
            {`${item.name} (${info.name})`}
          </button>
        );
      })}
    </div>
  );
  // @solution-end
}
