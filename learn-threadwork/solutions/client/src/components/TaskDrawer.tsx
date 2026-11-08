import { useEffect, useState } from "react";
import { IMPORTANCE, type Importance, type Task } from "@app/shared/types";
import { GROWTH } from "@app/shared/growth";
import { IMPORTANCE_LABEL } from "@app/client/src/format";

export interface TaskDrawerProps {
  task: Task;
  allTasks: Task[];
  onClose: () => void;
  onRename: (id: string, title: string) => void;
  onSetImportance: (id: string, importance: Importance) => void;
  onLink: (id: string, otherId: string) => void;
  onUnlink: (id: string, otherId: string) => void;
  onComplete: (id: string) => void;
}

export function TaskDrawer({ task, allTasks, onClose, onRename, onSetImportance, onLink, onUnlink, onComplete }: TaskDrawerProps) {
  const [title, setTitle] = useState(task.title);
  useEffect(() => setTitle(task.title), [task.id, task.title]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function commit() {
    const t = title.trim();
    if (!t) { setTitle(task.title); return; }
    if (t !== task.title) onRename(task.id, t);
  }

  const linked = allTasks.filter(t => task.links.includes(t.id));
  const linkable = allTasks.filter(t => t.id !== task.id && !task.links.includes(t.id));

  return (
    <aside role="dialog" aria-label="Task details" className="drawer">
      <button type="button" onClick={onClose}>Close</button>
      <label htmlFor="d-title">Title</label>
      <input id="d-title" value={title} onChange={e => setTitle(e.target.value)} onBlur={commit}
        onKeyDown={e => { if (e.key === "Enter") commit(); }} />
      <label htmlFor="d-imp">Importance</label>
      <select id="d-imp" value={task.importance} onChange={e => onSetImportance(task.id, e.target.value as Importance)}>
        {IMPORTANCE.map(i => <option key={i} value={i}>{IMPORTANCE_LABEL[i]} · +{GROWTH[i]}%</option>)}
      </select>
      <h3>Linked tasks</h3>
      <ul>
        {linked.map(t => (
          <li key={t.id}>{t.title} <button type="button" onClick={() => onUnlink(task.id, t.id)}>Unlink {t.title}</button></li>
        ))}
      </ul>
      <label htmlFor="d-link">Link to another task</label>
      <select id="d-link" value="" onChange={e => { if (e.target.value) onLink(task.id, e.target.value); }}>
        <option value="">Choose a task…</option>
        {linkable.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
      </select>
      {task.status === "done"
        ? <p>Finished on {task.doneAt}</p>
        : <button type="button" className="primary" onClick={() => onComplete(task.id)}>Complete · +{GROWTH[task.importance]}% growth</button>}
    </aside>
  );
}
