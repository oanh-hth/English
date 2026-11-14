import { useId } from "react";
import type { Decision } from "@app/shared/decisions";
import { categoryById } from "@app/shared/categories";

export interface DecisionCardProps {
  decision: Decision;
  onCategory: (categoryId: string) => void;
  onEdit: (taskId: string) => void;
}

export function DecisionCard({ decision: d, onCategory, onEdit }: DecisionCardProps) {
  const id = useId();
  const name = categoryById(d.category)?.name ?? d.category;
  return (
    <article aria-labelledby={id} className="decision-card">
      <header>
        <h3 id={id}>{d.title}</h3>
        <time dateTime={d.doneAt}>{d.doneAt}</time>
      </header>
      <button type="button" className="pill category" aria-label={`Show all ${name} decisions`} onClick={() => onCategory(d.category)}>{name}</button>
      <dl>
        <dt>Result</dt><dd>{d.result}</dd>
        <dt>Decision</dt><dd>{d.decision}</dd>
      </dl>
      <button type="button" aria-label={`Edit ${d.title}`} onClick={() => onEdit(d.taskId)}>Edit</button>
    </article>
  );
}
