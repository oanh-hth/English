// Given: the Sketch page. Uses SketchPad (Part 6), the sketches reducer (6.3) and SketchGallery (6.4).
import { useEffect, useState } from "react";
import { useApp } from "@app/client/src/state/AppContext";
import { SketchPad } from "@app/client/src/components/SketchPad";
import { SketchGallery } from "@app/client/src/components/SketchGallery";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { todayKey } from "@app/client/src/format";
import { newId, useShell } from "@app/client/src/views/shared";

export function SketchView() {
  const { state, dispatch } = useApp();
  const { selected } = useShell();
  const [editing, setEditing] = useState<string | null>(selected.sketchId ?? null);
  useEffect(() => { if (selected.sketchId) setEditing(selected.sketchId); }, [selected.sketchId]);
  const current = state.sketches.find(s => s.id === editing) ?? null;
  const [title, setTitle] = useState(current?.title ?? "");
  const [taskId, setTaskId] = useState<string>(current?.taskId ?? "");
  useEffect(() => { setTitle(current?.title ?? ""); setTaskId(current?.taskId ?? ""); }, [current?.id]);

  return (
    <div className="stack">
      <section className="card">
        <h1>{current ? `Editing “${current.title}”` : "New sketch"}</h1>
        <div className="row">
          <label htmlFor="sk-title">Title</label><input id="sk-title" value={title} onChange={e => setTitle(e.target.value)} />
          <label htmlFor="sk-task">Task</label>
          <select id="sk-task" value={taskId} onChange={e => setTaskId(e.target.value)}>
            <option value="">No task</option>
            {state.tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          {current && <button onClick={() => setEditing(null)}>New sketch</button>}
        </div>
        <ErrorBoundary area="Sketching">
          <SketchPad key={current?.id ?? "new"} initial={current?.strokes ?? []} onSave={(strokes, width, height) => {
            const id = current?.id ?? newId();
            dispatch({ type: "saveSketch", today: todayKey(), sketch: { id, title, taskId: taskId || null, strokes, width, height } });
            setEditing(id);
          }} />
        </ErrorBoundary>
      </section>
      <section className="card"><h2>Saved sketches</h2>
        <ErrorBoundary area="Saved sketches">
          <SketchGallery sketches={state.sketches} tasks={state.tasks} onOpen={setEditing}
            onDelete={id => { dispatch({ type: "deleteSketch", id }); if (id === editing) setEditing(null); }} />
        </ErrorBoundary>
      </section>
    </div>
  );
}
