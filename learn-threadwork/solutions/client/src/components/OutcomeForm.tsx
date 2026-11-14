import { useEffect, useState, type FormEvent } from "react";
import type { Outcome, Task } from "@app/shared/types";
import { categoriesByGroup, GROUPS } from "@app/shared/categories";
import { parseOutcome } from "@app/shared/collections";

export interface OutcomeFormProps {
  task: Task;
  onSave: (outcome: Outcome) => void;
  onCancel: () => void;
}

export function OutcomeForm({ task, onSave, onCancel }: OutcomeFormProps) {
  const [result, setResult] = useState(task.outcome?.result ?? "");
  const [decision, setDecision] = useState(task.outcome?.decision ?? "");
  const [category, setCategory] = useState(task.outcome?.category ?? "");
  const [error, setError] = useState("");
  const groups = categoriesByGroup();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const r = parseOutcome({ result, decision, category });
    if (!r.ok) { setError(r.error); return; }
    onSave(r.value);
  }

  return (
    <form role="dialog" aria-label="Record the result" className="outcome-form" onSubmit={submit} noValidate>
      <h2>{task.title}</h2>
      <label htmlFor="o-result">Result</label>
      <textarea id="o-result" rows={4} value={result} placeholder="What happened? What did you find out?" onChange={e => setResult(e.target.value)} />
      <label htmlFor="o-decision">Decision</label>
      <textarea id="o-decision" rows={3} value={decision} placeholder="What did you decide, and why?" onChange={e => setDecision(e.target.value)} />
      <label htmlFor="o-category">Category</label>
      <select id="o-category" value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">Choose a category…</option>
        {GROUPS.map(g => (
          <optgroup key={g} label={g}>
            {groups[g].map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </optgroup>
        ))}
      </select>
      {error && <p role="alert" className="error">{error}</p>}
      <div className="row">
        <button type="submit" className="primary">Save decision</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
