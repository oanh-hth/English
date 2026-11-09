import { useState, type FormEvent } from "react";
import type { Resource, ResourceKind, Task } from "@app/shared/types";
import type { Usage } from "@app/shared/resources";

export const KINDS: ResourceKind[] = ["link", "file", "tool", "book", "person"];

export interface ResourceLibraryProps {
  resources: Resource[];
  tasks: Task[];
  usage: Record<string, Usage>;
  onAdd: (name: string, kind: ResourceKind, url: string) => void;
  onRemove: (id: string) => void;
  onOpenTask: (id: string) => void;
}

export function ResourceLibrary({ resources, tasks, usage, onAdd, onRemove, onOpenTask }: ResourceLibraryProps) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<ResourceKind>("link");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const title = (id: string) => tasks.find(t => t.id === id)?.title ?? "";

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Give the resource a name"); return; }
    onAdd(name, kind, url);
    setName(""); setUrl(""); setKind("link"); setError("");
  }

  return (
    <div className="library">
      <form onSubmit={submit} className="row">
        <label htmlFor="r-name">Name</label>
        <input id="r-name" value={name} onChange={e => setName(e.target.value)} />
        <label htmlFor="r-kind">Kind</label>
        <select id="r-kind" value={kind} onChange={e => setKind(e.target.value as ResourceKind)}>
          {KINDS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <label htmlFor="r-url">Link</label>
        <input id="r-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://… (optional)" />
        <button type="submit">Add resource</button>
        {error && <p role="alert" className="error">{error}</p>}
      </form>
      {resources.length === 0 ? (
        <p className="muted">No resources yet. Add the files, links, tools, books and people you work with.</p>
      ) : (
        <table>
          <thead><tr><th>Name</th><th>Kind</th><th>Used</th><th>Tasks</th><th /></tr></thead>
          <tbody>
            {resources.map(r => {
              const u = usage[r.id] ?? { taskIds: [], usedIn: 0 };
              return (
                <tr key={r.id}>
                  <td>{r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.name}</a> : r.name}</td>
                  <td>{r.kind}</td>
                  <td>Used in {u.usedIn} of {u.taskIds.length} tasks</td>
                  <td>{u.taskIds.map(id => <button key={id} type="button" onClick={() => onOpenTask(id)}>{title(id)}</button>)}</td>
                  <td><button type="button" onClick={() => onRemove(r.id)}>Delete {r.name}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
