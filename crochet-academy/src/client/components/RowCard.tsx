import { todo } from '@/shared/todo';
import type { ChartMode, Row } from '@/shared/types';
import { itemText } from '@/core/rowText';
import { rowStats } from '@/core/rowStats';

export interface RowCardProps {
  row: Row;
  /** Zero-based position of the row in the chart. */
  index: number;
  mode: ChartMode;
  active: boolean;
  uk?: boolean;
  onSelect: (rowId: string) => void;
  onRemove: (rowId: string) => void;
  onNoteChange: (rowId: string, note: string) => void;
}

/**
 * Exercise 3.3: one row of the pattern in the editor.
 *
 * <section className="row-card" aria-label="Row 1" aria-current={active ? 'true' : undefined} onClick -> onSelect(row.id)>
 *   <h3>Row 1</h3>                         "Round 1" when mode is 'round'; the number is index + 1
 *   <span data-testid="stitch-count">12 sts</span>        rowStats(row.items).made
 *   <ul> one <li> per item, text from itemText(item, uk) </ul>
 *        or, when the row has no items:  <p>Empty. Pick a stitch and add it.</p>
 *   <button aria-label="Delete Row 1">  calls onRemove(row.id) and must NOT also select the row (stopPropagation)
 *   <textarea aria-label="Note for Row 1" value={row.note}>   onChange -> onNoteChange(row.id, newText)
 * </section>
 *
 * Clicking inside the textarea should not be a problem: selecting a row that is already active is harmless.
 */
export function RowCard(props: RowCardProps) {
  // TODO(3.3)
  return todo('3.3');
}
