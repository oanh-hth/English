// Given: the Notes page. Uses the notes reducer (5.1) and NoteEditor (5.2).
import { useEffect, useState } from "react";
import { useApp } from "@app/client/src/state/AppContext";
import { NoteEditor } from "@app/client/src/components/NoteEditor";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { todayKey } from "@app/client/src/format";
import { newId, useShell } from "@app/client/src/views/shared";

const KIND = { note: "Note", draft: "Draft", table: "Table" } as const;

export function NotesView() {
  const { state, dispatch } = useApp();
  const { go, selected } = useShell();
  const sorted = [...state.notes].sort((a, b) => b.updatedAt - a.updatedAt);
  const [openId, setOpenId] = useState<string | null>(selected.noteId ?? sorted[0]?.id ?? null);
  useEffect(() => { if (selected.noteId) setOpenId(selected.noteId); }, [selected.noteId]);
  const note = state.notes.find(n => n.id === openId) ?? null;
  const add = (kind: "note" | "draft" | "table") => { const id = newId(); dispatch({ type: "addNote", id, kind, taskId: null, now: Date.now() }); setOpenId(id); };
  const taskTitle = (id: string | null) => (id && state.tasks.find(t => t.id === id)?.title) || "";

  return (
    <div className="notes">
      <aside className="card">
        <div className="row"><button onClick={() => add("note")}>New note</button><button onClick={() => add("draft")}>New draft</button><button onClick={() => add("table")}>New table</button></div>
        <ul className="note-list">
          {sorted.map(n => (
            <li key={n.id}><button aria-current={n.id === openId} onClick={() => setOpenId(n.id)}>
              <b>{n.title || "Untitled"}</b><small>{KIND[n.kind]}{n.taskId ? ` · ${taskTitle(n.taskId)}` : ""}</small></button></li>
          ))}
        </ul>
        {sorted.length === 0 && <p className="muted">Notes catch what you might forget, drafts hold longer writing, tables rough out numbers.</p>}
      </aside>
      <section className="card">
        {note ? (
          <ErrorBoundary area="The note editor">
            <NoteEditor note={note} tasks={state.tasks}
              onEdit={patch => dispatch({ type: "editNote", id: note.id, ...patch, now: Date.now() })}
              onSetCell={(row, col, value) => dispatch({ type: "setCell", id: note.id, row, col, value, now: Date.now() })}
              onAddRow={() => dispatch({ type: "addRow", id: note.id, now: Date.now() })}
              onAddColumn={() => dispatch({ type: "addColumn", id: note.id, now: Date.now() })}
              onLink={taskId => dispatch({ type: "linkNote", id: note.id, taskId })}
              onToTask={() => { const taskId = newId(); dispatch({ type: "noteToTask", id: note.id, taskId, today: todayKey() }); go("tasks", { taskId }); }}
              onDelete={() => { dispatch({ type: "deleteNote", id: note.id }); setOpenId(null); }} />
          </ErrorBoundary>
        ) : <p className="muted">Choose a note, or start a new one.</p>}
      </section>
    </div>
  );
}
