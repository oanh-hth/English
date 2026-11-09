import { useState } from 'react';
import type { Chart, ChartInput } from '@/shared/types';
import { newId } from '@/shared/id';
import { DEFAULT_ROW_COLOR } from '@/shared/palette';
import type { UseChartsResult } from '../hooks/useCharts';
import type { ApiClient } from '../api/client';
import { ImportForm } from '../components/ImportDialog';
import { PhotoImport } from '../photo/PhotoImport';
import { ExerciseBoundary } from '../ExerciseBoundary';

const BLANK: ChartInput = { name: 'New chart', mode: 'flat', rows: [{ id: 'first', color: DEFAULT_ROW_COLOR, note: '', items: [] }] };

/** PROVIDED: the list of saved charts. Uses your API client (5.1) and data hook (5.2). */
export function ChartListPage({ api, useList, uk, notice, onOpen }: {
  api: ApiClient;
  /** The data hook: your useCharts (5.2), or the provided local stand-in while it is still a stub. */
  useList: (api: ApiClient) => UseChartsResult;
  uk: boolean;
  notice?: string;
  onOpen: (chart: Chart) => void;
}) {
  const { status, charts, error, create, remove, refresh } = useList(api);
  const [importing, setImporting] = useState<'text' | 'photo' | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>) {
    setProblem(null);
    try {
      await action();
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Something went wrong');
    }
  }

  return (
    <section>
      <div className="page-head">
        <div><h1>My charts</h1><p className="muted">Saved on the server you built in part 4.</p></div>
        <div className="head-actions">
          <button type="button" className="btn" onClick={() => setImporting('photo')}>Import from photo</button>
          <button type="button" className="btn" onClick={() => setImporting('text')}>Import pattern</button>
          <button type="button" className="btn primary" onClick={() => run(async () => onOpen(await create({ ...BLANK, rows: [{ ...BLANK.rows[0], id: newId() }] })))}>+ New chart</button>
        </div>
      </div>

      {notice ? <p className="notice" role="note">{notice}</p> : null}
      {problem ? <p className="hint" role="alert">{problem}</p> : null}
      {status === 'loading' ? <p className="muted">Loading…</p> : null}
      {status === 'error' ? (
        <div className="card error-card" role="alert">
          <p>Could not load your charts: {error}</p>
          <button type="button" className="btn sm" onClick={() => void refresh()}>Try again</button>
        </div>
      ) : null}
      {status === 'ready' && charts.length === 0 ? <p className="card empty">No charts yet. Create one or import a pattern.</p> : null}

      <ul className="grid">
        {charts.map((chart) => (
          <li key={chart.id} className="card chart-card">
            <h3>{chart.name}</h3>
            <p className="muted small">{chart.rows.length} {chart.mode === 'round' ? 'rounds' : 'rows'} · {chart.mode === 'round' ? 'in the round' : 'flat'}</p>
            <div className="card-actions">
              <button type="button" className="btn sm primary" onClick={() => onOpen(chart)}>Open</button>
              <button type="button" className="btn sm danger" onClick={() => run(() => remove(chart.id))}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {importing ? (
        <div className="modal" role="dialog" aria-modal="true" aria-label={importing === 'photo' ? 'Import from a photo' : 'Import a pattern'}>
          <div className="card sheet">
            {importing === 'text' ? (
              <ExerciseBoundary feature="the pattern importer">
                <ImportForm uk={uk} onClose={() => setImporting(null)} onCreate={(input) => { setImporting(null); void run(async () => onOpen(await create(input))); }} />
              </ExerciseBoundary>
            ) : (
              <ExerciseBoundary feature="the photo importer">
                <PhotoImport onCreate={(input) => { setImporting(null); void run(async () => onOpen(await create(input))); }} />
              </ExerciseBoundary>
            )}
            <div className="actions"><button type="button" className="btn" onClick={() => setImporting(null)}>Close</button></div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
