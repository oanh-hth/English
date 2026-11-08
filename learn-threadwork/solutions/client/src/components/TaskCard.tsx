import type { Day, Task } from "@app/shared/types";
import { IMPORTANCE_LABEL, dueLabel } from "@app/client/src/format";

export interface TaskCardProps {
  task: Task;
  today: Day;
  onOpen: (id: string) => void;
}

export function TaskCard({ task, today, onOpen }: TaskCardProps) {
  const due = dueLabel(task.due, today);
  const n = task.resources.length;
  return (
    <button type="button" className="task-card" data-status={task.status} onClick={() => onOpen(task.id)}>
      <h3>{task.title}</h3>
      <span className="meta">
        <span className={`pill ${task.importance}`}>{IMPORTANCE_LABEL[task.importance]}</span>
        {due && <span>{due}</span>}
        {task.links.length > 0 && <span>{task.links.length} linked</span>}
        {n > 0 && <span>{n} {n === 1 ? "resource" : "resources"}</span>}
      </span>
    </button>
  );
}
