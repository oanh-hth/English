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
  // TODO: Display first (filter, map, categoryInfo). For dragging keep `drag` state { id, x, y }
  //       plus a ref that remembers whether the pointer moved. Put onPointerMove / onPointerUp /
  //       onPointerCancel on the container so a fast pointer that leaves the button still works.
  throw new Error('Not implemented yet');
}
