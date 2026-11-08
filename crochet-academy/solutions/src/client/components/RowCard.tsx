import type { ChartMode, Row } from '@/shared/types';
import { itemText } from '@/core/rowText';
import { rowStats } from '@/core/rowStats';

export interface RowCardProps {
  row: Row;
  index: number;
  mode: ChartMode;
  active: boolean;
  uk?: boolean;
  onSelect: (rowId: string) => void;
  onRemove: (rowId: string) => void;
  onNoteChange: (rowId: string, note: string) => void;
}

export function RowCard({ row, index, mode, active, uk = false, onSelect, onRemove, onNoteChange }: RowCardProps) {
  const label = `${mode === 'round' ? 'Round' : 'Row'} ${index + 1}`;
  return (
    <section className="row-card" aria-label={label} aria-current={active ? 'true' : undefined} onClick={() => onSelect(row.id)}>
      <header className="row-head">
        <h3>{label}</h3>
        <span className="pill" data-testid="stitch-count">{rowStats(row.items).made} sts</span>
        <button
          type="button"
          className="icon"
          aria-label={`Delete ${label}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(row.id);
          }}
        >
          ✕
        </button>
      </header>
      {row.items.length ? (
        <ul className="chips">
          {row.items.map((item, i) => (
            <li key={i} className="chip">{itemText(item, uk)}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">Empty. Pick a stitch and add it.</p>
      )}
      <textarea
        className="note-in"
        aria-label={`Note for ${label}`}
        rows={2}
        value={row.note}
        placeholder="Note for this row (optional)"
        onChange={(event) => onNoteChange(row.id, event.target.value)}
      />
    </section>
  );
}
