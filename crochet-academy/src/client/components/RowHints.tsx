import type { Chart } from '@/shared/types';
import { rowHints } from '@/core/rowHints';

/** PROVIDED: yellow notes under the rows that may have a miscount. Uses your rowHints (exercise 1.5). */
export function RowHints({ chart, onDismiss }: { chart: Chart; onDismiss: (rowId: string) => void }) {
  const hints = rowHints(chart);
  if (!hints.length) return null;
  return (
    <ul className="hints" aria-label="Stitch count hints">
      {hints.map((hint) => {
        const index = chart.rows.findIndex((r) => r.id === hint.rowId);
        return (
          <li key={hint.rowId} className="hint">
            {chart.mode === 'round' ? 'Round' : 'Row'} {index + 1} works into {hint.used} stitches, but the one before has {hint.previous}.{' '}
            <button type="button" onClick={() => onDismiss(hint.rowId)}>That's fine</button>
          </li>
        );
      })}
    </ul>
  );
}
