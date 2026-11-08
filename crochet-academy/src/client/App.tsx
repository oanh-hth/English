import { Component, useMemo, useState, type ReactNode } from 'react';
import type { Chart } from '@/shared/types';
import { NotImplementedError } from '@/shared/todo';
import { createApiClient, type ApiClient } from './api/client';
import { createLocalClient } from './api/localClient';
import { useCharts, type UseChartsResult } from './hooks/useCharts';
import { useLocalCharts } from './hooks/useLocalCharts';
import { ChartListPage } from './pages/ChartListPage';
import { EditorPage } from './pages/EditorPage';

/** PROVIDED: the app shell. */
export function App() {
  const [uk, setUk] = useState(false);
  return (
    <>
      <header className="top">
        <div className="brand">Cozy Hook Nook <span className="muted small">Academy</span></div>
        <button type="button" className="btn sm" aria-pressed={uk} onClick={() => setUk(!uk)}>{uk ? 'UK terms' : 'US terms'}</button>
      </header>
      <main>
        <UseLocalUntilBuilt fallback={<ChartsApp uk={uk} api={localApi} useList={useLocalCharts} notice="Saving in this browser only. Build exercises 5.1 and 5.2 (and reload) to save on your own server instead." />}>
          <RemoteCharts uk={uk} />
        </UseLocalUntilBuilt>
      </main>
    </>
  );
}

const localApi = createLocalClient();

/** Uses YOUR API client (5.1) and data hook (5.2). */
function RemoteCharts({ uk }: { uk: boolean }) {
  const api = useMemo(() => createApiClient(), []);
  return <ChartsApp uk={uk} api={api} useList={useCharts} />;
}

/**
 * While exercise 5.1 or 5.2 is still a stub, show the same app backed by the browser's localStorage,
 * so the importer (phase 2) and the editor (phase 3) can be tried as soon as they are built.
 * Any other error is passed on to the next boundary.
 * (It does not reset itself on hot updates, which would remount the editor and lose your place:
 * after finishing 5.1 and 5.2, reload the page once.)
 */
class UseLocalUntilBuilt extends Component<{ fallback: ReactNode; children: ReactNode }, { error: unknown }> {
  state = { error: null as unknown };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error === null) return this.props.children;
    if (error instanceof NotImplementedError && (error.exercise === '5.1' || error.exercise === '5.2')) return this.props.fallback;
    throw error; // not ours: let the next boundary deal with it
  }
}

function ChartsApp({ uk, api, useList, notice }: { uk: boolean; api: ApiClient; useList: (api: ApiClient) => UseChartsResult; notice?: string }) {
  const [open, setOpen] = useState<Chart | null>(null);
  if (open) {
    return (
      <EditorPage
        key={open.id}
        initial={open}
        uk={uk}
        onBack={() => setOpen(null)}
        onSave={async (chart) => {
          await api.update(chart.id, { name: chart.name, mode: chart.mode, rows: chart.rows });
        }}
      />
    );
  }
  return <ChartListPage api={api} useList={useList} uk={uk} notice={notice} onOpen={setOpen} />;
}
