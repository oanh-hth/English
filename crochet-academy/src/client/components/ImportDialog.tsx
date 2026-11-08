import { useMemo, useState } from 'react';
import type { ChartInput } from '@/shared/types';
import { newId } from '@/shared/id';
import { PALETTE } from '@/shared/palette';
import { parsePattern } from '@/parse/pattern';
import { rowText } from '@/core/rowText';

const EXAMPLE = `Pink flower coaster
Round 1: MR, 12 dc (12)
Round 2: (dc, ch 1) x 12 (24)
Round 3: (2 dc, ch 1) x 12
Round 4: (shell, 3 sc) x 12`;

/** PROVIDED: paste written rounds and create a chart from them. Uses parsePattern (2.3) and rowText (1.4). */
export function ImportForm({ uk, onCreate, onClose }: { uk: boolean; onCreate: (input: ChartInput) => void; onClose: () => void }) {
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const parsed = useMemo(() => parsePattern(text, { uk }), [text, uk]);
  const unit = parsed.mode === 'round' ? 'Rnd' : 'Row';

  function create() {
    const rows = parsed.rows.map((row) => ({ id: newId(), color: PALETTE[1][1], note: row.unknown.length ? `Check: ${row.unknown.join('; ')}` : '', items: row.items }));
    onCreate({ name: name.trim() || 'Imported pattern', mode: parsed.mode, rows });
  }

  return (
    <>
        <h2>Import a pattern</h2>
        <label htmlFor="imp-text">Pattern text</label>
        <textarea id="imp-text" rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder="Round 1: MR, 6 sc (6)&#10;Round 2: 6 inc (12)" />
        <label htmlFor="imp-name">Name</label>
        <input id="imp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Imported pattern" />
        {parsed.rows.length ? (
          <ol className="imp-list" aria-label="Rows found">
            {parsed.rows.map((row, i) => (
              <li key={i}>
                <b>{unit} {i + 1}:</b> {rowText(row.items, uk)}
                {row.unknown.length ? <span className="warn"> couldn't read: {row.unknown.join(', ')}</span> : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted small">{text.trim() ? 'No rows found. Start each row with "Round 1:" or "Row 1:".' : 'Paste a pattern to see the rows it understands.'}</p>
        )}
        <div className="actions">
          <button type="button" className="btn" onClick={() => setText(EXAMPLE)}>Try an example</button>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="button" className="btn primary" disabled={!parsed.rows.length} onClick={create}>Create chart</button>
        </div>
    </>
  );
}
