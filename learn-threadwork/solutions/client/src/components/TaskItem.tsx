import type { Day, Task } from "@app/shared/types";
import { dueLabel } from "@app/shared/dates";
import { categoryById } from "@app/shared/categories";

export interface TaskItemProps {
  task: Task;
  today: Day;
  onComplete: (id: string) => void;
  onRecord: (id: string) => void;
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, today, onComplete, onRecord, onReopen, onDelete }: TaskItemProps) {
  const done = task.status === "done";
  const due = !done ? dueLabel(task.due, today) : "";
  return (
    <li className="task-item" data-status={task.status} data-complexity={task.complexity}>
      {!done && task.complexity === "simple" && (
        <input type="checkbox" className="tick" aria-label={`Done: ${task.title}`} onChange={() => onComplete(task.id)} />
      )}
      <div className="body">
        <span className="title">{task.title}</span>
        <span className="meta">
          {task.complexity === "complex" && <span className="pill complex">Complex</span>}
          {due && <span className={due.includes("overdue") ? "due overdue" : "due"}>{due}</span>}
          {done && <span>Done {task.doneAt}</span>}
          {done && task.outcome && <span className="pill category">{categoryById(task.outcome.category)?.name ?? task.outcome.category}</span>}
        </span>
        {done && task.outcome && <p className="decision">{task.outcome.decision}</p>}
      </div>
      <div className="actions">
        {!done && task.complexity === "complex" && (
          <button type="button" className="primary" aria-label={`Record result for ${task.title}`} onClick={() => onRecord(task.id)}>Record result</button>
        )}
        {done && task.outcome && <button type="button" aria-label={`Edit result for ${task.title}`} onClick={() => onRecord(task.id)}>Edit result</button>}
        {done && <button type="button" aria-label={`Reopen ${task.title}`} onClick={() => onReopen(task.id)}>Reopen</button>}
        <button type="button" className="ghost" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </li>
  );
}
