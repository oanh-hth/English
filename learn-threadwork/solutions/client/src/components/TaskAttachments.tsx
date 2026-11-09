import type { Note, Resource, Sketch, Task } from "@app/shared/types";

export interface TaskAttachmentsProps {
  task: Task;
  resources: Resource[];
  notes: Note[];
  sketches: Sketch[];
  onAttach: (resourceId: string) => void;
  onDetach: (resourceId: string) => void;
  onMarkUsed: (resourceId: string, used: boolean) => void;
  onOpenNote: (id: string) => void;
  onOpenSketch: (id: string) => void;
  onNewNote: (kind: "note" | "draft" | "table") => void;
}

export function TaskAttachments({ task, resources, notes, sketches, onAttach, onDetach, onMarkUsed, onOpenNote, onOpenSketch, onNewNote }: TaskAttachmentsProps) {
  const byId = new Map(resources.map(r => [r.id, r]));
  const attached = task.resources.filter(x => byId.has(x.resourceId));
  const free = resources.filter(r => !task.resources.some(x => x.resourceId === r.id));
  return (
    <section aria-label="Attachments" className="attachments">
      <h3>Resources</h3>
      {attached.length === 0 && <p className="muted">No resources yet</p>}
      <ul>
        {attached.map(x => {
          const r = byId.get(x.resourceId)!;
          return (
            <li key={r.id}>
              {r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.name}</a> : <span>{r.name}</span>}
              <label><input type="checkbox" checked={x.used} aria-label={`Used ${r.name}`} onChange={e => onMarkUsed(r.id, e.target.checked)} /> Used</label>
              <button type="button" onClick={() => onDetach(r.id)}>Remove {r.name}</button>
            </li>
          );
        })}
      </ul>
      <label htmlFor="attach-res">Attach a resource</label>
      <select id="attach-res" value="" onChange={e => { if (e.target.value) onAttach(e.target.value); }}>
        <option value="">Choose…</option>
        {free.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>
      <h3>Notes and sketches</h3>
      <div className="row">
        {notes.map(n => <button key={n.id} type="button" onClick={() => onOpenNote(n.id)}>{n.title || "Untitled note"}</button>)}
        {sketches.map(s => <button key={s.id} type="button" onClick={() => onOpenSketch(s.id)}>{s.title}</button>)}
      </div>
      <div className="row">
        <button type="button" onClick={() => onNewNote("note")}>New note</button>
        <button type="button" onClick={() => onNewNote("draft")}>New draft</button>
        <button type="button" onClick={() => onNewNote("table")}>New table</button>
      </div>
    </section>
  );
}
