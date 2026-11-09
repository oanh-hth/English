import type { Note, Task } from "@app/shared/types";

export interface NoteEditorProps {
  note: Note;
  tasks: Task[];
  onEdit: (patch: { title?: string; body?: string }) => void;
  onSetCell: (row: number, col: number, value: string) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  onLink: (taskId: string | null) => void;
  onToTask: () => void;
  onDelete: () => void;
}

export function NoteEditor({ note, tasks, onEdit, onSetCell, onAddRow, onAddColumn, onLink, onToTask, onDelete }: NoteEditorProps) {
  return (
    <section aria-label="Note editor" className="note-editor">
      <label htmlFor="n-title">Title</label>
      <input id="n-title" placeholder="Untitled" value={note.title} onChange={e => onEdit({ title: e.target.value })} />
      <label htmlFor="n-task">Task</label>
      <select id="n-task" value={note.taskId ?? ""} onChange={e => onLink(e.target.value || null)}>
        <option value="">No task</option>
        {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
      </select>
      {note.kind === "table" ? (
        <>
          <div className="table-wrap">
            <table>
              <tbody>
                {note.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c}><input aria-label={`Row ${r + 1}, column ${c + 1}`} value={cell} onChange={e => onSetCell(r, c, e.target.value)} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row"><button type="button" onClick={onAddRow}>Add row</button><button type="button" onClick={onAddColumn}>Add column</button></div>
        </>
      ) : (
        <>
          <label htmlFor="n-body">Text</label>
          <textarea id="n-body" rows={note.kind === "draft" ? 16 : 6} value={note.body} onChange={e => onEdit({ body: e.target.value })} />
        </>
      )}
      <div className="row">
        {note.kind === "note" && <button type="button" onClick={onToTask}>Turn into task</button>}
        <button type="button" onClick={onDelete}>Delete note</button>
      </div>
    </section>
  );
}
