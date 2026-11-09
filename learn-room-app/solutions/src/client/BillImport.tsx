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
  // @solution-start State: text, rows, format, checked (a Set of row indexes), busy, error. Reset `checked` to all indexes whenever new rows arrive. Keep the click handlers async with try/catch/finally.
  const [text, setText] = useState('');
  const [rows, setRows] = useState<BillRow[]>([]);
  const [format, setFormat] = useState<BillFormat | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function read() {
    setBusy(true);
    setError('');
    try {
      const result = await parse(text);
      if (result.rows.length === 0) {
        setRows([]);
        setFormat(null);
        setError('No items found in this text');
      } else {
        setRows(result.rows);
        setFormat(result.format);
        setChecked(new Set(result.rows.map((_, i) => i)));
      }
    } catch (e) {
      setRows([]);
      setFormat(null);
      setError(e instanceof Error ? e.message : 'Could not read the bill');
    } finally {
      setBusy(false);
    }
  }

  async function add() {
    const chosen = rows.filter((_, i) => checked.has(i));
    await onAdd(chosen);
    setText('');
    setRows([]);
    setFormat(null);
    setChecked(new Set());
  }

  function toggle(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <section aria-label="Import a bill">
      <label htmlFor="bill-text">Bill text</label>
      <textarea id="bill-text" value={text} onChange={(e) => setText(e.target.value)} rows={6} />
      <button type="button" disabled={busy || text.trim() === ''} onClick={() => void read()}>
        {busy ? 'Reading…' : 'Read bill'}
      </button>
      {error && <p role="alert">{error}</p>}
      {format && rows.length > 0 && (
        <>
          <p>Found: {FORMAT_NAMES[format]}</p>
          <ul>
            {rows.map((row, i) => (
              <li key={`${i}-${row.name}`}>
                <input type="checkbox" aria-label={`Add ${row.name}`} checked={checked.has(i)} onChange={() => toggle(i)} />
                {`${row.name} x${row.qty} - ${formatVND(row.price)}`}
              </li>
            ))}
          </ul>
          <button type="button" disabled={checked.size === 0} onClick={() => void add()}>
            {`Add selected (${checked.size})`}
          </button>
        </>
      )}
    </section>
  );
  // @solution-end
}
