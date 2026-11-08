import type { Chart } from '@/shared/types';
import { rowText } from '@/core/rowText';

/** PROVIDED: the pattern as text, one line per row. Uses your rowText (exercise 1.4). */
export function WrittenPattern({ chart, uk }: { chart: Chart; uk: boolean }) {
  const label = chart.mode === 'round' ? 'Rnd' : 'Row';
  return (
    <section className="written" aria-label="Written pattern">
      <h2>Written pattern</h2>
      <ol>
        {chart.rows.map((row, i) => (
          <li key={row.id}>
            <b>{label} {i + 1}:</b> {rowText(row.items, uk)}
            {row.note ? <span className="note">{row.note}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
