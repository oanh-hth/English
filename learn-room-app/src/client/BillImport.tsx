import { useState, type ReactElement } from 'react';
import type { BillFormat, BillRow } from '../domain/billTypes';
import { formatVND } from '../domain/spending';

interface Props {
  /** Reads bill text (the server's POST /api/bills/parse). */
  parse: (text: string) => Promise<{ format: BillFormat; rows: BillRow[] }>;
  /** Adds the chosen rows to the room. */
  onAdd: (rows: BillRow[]) => void | Promise<void>;
}

const FORMAT_NAMES: Record<BillFormat, string> = { 'dine-in': 'Café receipt', shopee: 'Shopee order', receipt: 'Shop receipt' };

/**
 * Import items from the text of a bill.
 *  1. <label>Bill text</label> + <textarea>, and a button "Read bill" (disabled while the textarea is empty or a read is running)
 *  2. clicking it calls parse(text). While waiting the button shows "Reading…".
 *  3. success with rows: show the paragraph "Found: <format name>" (see FORMAT_NAMES), and a list with one <li> per row:
 *       a checkbox (checked by default, accessible name "Add <name>") and the text "<name> x<qty> - <price as VND>"
 *     and a button "Add selected (<n>)" where n counts the ticked rows (disabled when n is 0)
 *  4. success with no rows: role="alert" "No items found in this text"
 *  5. parse rejects: role="alert" with the error message
 *  6. clicking "Add selected" calls onAdd with only the ticked rows (in order), then clears the textarea and the list
 */
export function BillImport({ parse, onAdd }: Props): ReactElement {
  // TODO: State: text, rows, format, checked (a Set of row indexes), busy, error. Reset `checked`
  //       to all indexes whenever new rows arrive. Keep the click handlers async with
  //       try/catch/finally.
  throw new Error('Not implemented yet');
}
