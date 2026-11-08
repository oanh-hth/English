import { useState } from 'react';
import type { Chart, LoopMod, StitchId } from '@/shared/types';
import { getStitch } from '@/core/stitchLookup';
import { useChart } from '../state/useChart';
import { StitchPicker } from '../components/StitchPicker';
import { RowCard } from '../components/RowCard';
import { RowHints } from '../components/RowHints';
import { WrittenPattern } from '../components/WrittenPattern';
import { SymbolChart } from '../chart/SymbolChart';
import { ExerciseBoundary } from '../ExerciseBoundary';

/**
 * PROVIDED: the editor. Each feature sits inside an ExerciseBoundary, so finishing an exercise
 * brings that piece of the page to life while the rest keeps working.
 */
export function EditorPage({ initial, uk, onSave, onBack }: { initial: Chart; uk: boolean; onSave: (chart: Chart) => Promise<void>; onBack: () => void }) {
  const [chart, dispatch] = useChart(initial);
  const [activeRowId, setActiveRowId] = useState<string | null>(initial.rows[0]?.id ?? null);
  const [stitch, setStitch] = useState<StitchId>('sc');
  const [count, setCount] = useState(1);
  const [mod, setMod] = useState<LoopMod>('');
  const [groupIndex, setGroupIndex] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<string | null>(null);

  const rowId = activeRowId ?? chart.rows[chart.rows.length - 1]?.id ?? null;

  function addStitch() {
    if (!rowId) return;
    const allowsMod = getStitch(stitch).allowsMod;
    dispatch({ type: 'addStitch', rowId, stitch: { st: stitch, n: count, mod: allowsMod ? mod : '' }, groupIndex });
  }

  async function save() {
    setStatus('Saving…');
    try {
      await onSave(chart);
      setStatus('Saved');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save');
    }
  }

  return (
    <div className="editor">
      <div className="ed-top">
        <button type="button" className="btn sm" onClick={onBack}>‹ My charts</button>
        <input className="name-input" aria-label="Chart name" value={chart.name} onChange={(e) => dispatch({ type: 'rename', name: e.target.value })} />
        <div className="seg" role="group" aria-label="Chart style">
          <button type="button" aria-pressed={chart.mode === 'flat'} onClick={() => dispatch({ type: 'setMode', mode: 'flat' })}>Flat rows</button>
          <button type="button" aria-pressed={chart.mode === 'round'} onClick={() => dispatch({ type: 'setMode', mode: 'round' })}>In the round</button>
        </div>
        <button type="button" className="btn sm primary" onClick={save}>Save</button>
        {status ? <span className="muted small" role="status">{status}</span> : null}
      </div>

      <div className="ed-grid">
        <div className="rows-pane">
          <section className="card picker">
            <h2>Pick a stitch</h2>
            <ExerciseBoundary feature="the stitch picker">
              <StitchPicker selected={stitch} onSelect={setStitch} uk={uk} />
            </ExerciseBoundary>
            <div className="pk-controls">
              <label>How many <input type="number" min={1} max={99} value={count} onChange={(e) => setCount(Math.max(1, Math.min(99, Number(e.target.value) || 1)))} /></label>
              <label>Loop
                <select value={mod} onChange={(e) => setMod(e.target.value as LoopMod)}>
                  <option value="">Both</option><option value="BLO">Back only</option><option value="FLO">Front only</option>
                </select>
              </label>
              <button type="button" className="btn primary" onClick={addStitch} disabled={!rowId}>Add stitch</button>
              <button type="button" className="btn" disabled={!rowId} onClick={() => { if (rowId) { dispatch({ type: 'addGroup', rowId }); setGroupIndex(chart.rows.find((r) => r.id === rowId)?.items.length); } }}>( ) Repeat group</button>
              {groupIndex !== undefined ? <button type="button" className="btn sm" onClick={() => setGroupIndex(undefined)}>Back to row</button> : null}
            </div>
          </section>

          <ExerciseBoundary feature="the row cards">
            {chart.rows.map((row, i) => (
              <RowCard
                key={row.id}
                row={row}
                index={i}
                mode={chart.mode}
                uk={uk}
                active={row.id === rowId}
                onSelect={(id) => { setActiveRowId(id); setGroupIndex(undefined); }}
                onRemove={(id) => dispatch({ type: 'removeRow', rowId: id })}
                onNoteChange={(id, note) => dispatch({ type: 'setNote', rowId: id, note })}
              />
            ))}
          </ExerciseBoundary>

          <ExerciseBoundary feature="the stitch-count hints">
            <RowHints chart={chart} onDismiss={(id) => dispatch({ type: 'dismissHint', rowId: id })} />
          </ExerciseBoundary>

          <button type="button" className="btn sage" onClick={() => { dispatch({ type: 'addRow' }); setActiveRowId(null); }}>
            + Add {chart.mode === 'round' ? 'round' : 'row'}
          </button>
        </div>

        <div className="card viz-pane">
          <h2>Chart</h2>
          <ExerciseBoundary feature="the symbol chart">
            <div className="viz"><SymbolChart chart={chart} activeRowId={rowId} uk={uk} onSelectRow={setActiveRowId} /></div>
          </ExerciseBoundary>
          <ExerciseBoundary feature="the written pattern">
            <WrittenPattern chart={chart} uk={uk} />
          </ExerciseBoundary>
        </div>
      </div>
    </div>
  );
}
