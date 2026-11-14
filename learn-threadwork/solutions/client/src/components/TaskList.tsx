import { useState } from "react";
import type { Day, Task } from "@app/shared/types";
import { sortTasks } from "@app/shared/collections";
import { TaskItem, type TaskItemProps } from "@app/client/src/components/TaskItem";

export type TaskHandlers = Pick<TaskItemProps, "onComplete" | "onRecord" | "onReopen" | "onDelete">;

export interface TaskListProps extends TaskHandlers {
  tasks: Task[];
  today: Day;
}

export function TaskList({ tasks, today, ...handlers }: TaskListProps) {
  const [showAll, setShowAll] = useState(false);
  const sorted = sortTasks(tasks);
  const todo = sorted.filter(t => t.status === "todo"), done = sorted.filter(t => t.status === "done");
  const visibleDone = showAll ? done : done.slice(0, 10);
  return (
    <div className="task-list">
      <section aria-label="To do">
        <h2>To do ({todo.length})</h2>
        {todo.length === 0 ? <p className="empty">Nothing to do. Capture a task above.</p>
          : <ul>{todo.map(t => <TaskItem key={t.id} task={t} today={today} {...handlers} />)}</ul>}
      </section>
      <section aria-label="Done">
        <h2>Done ({done.length})</h2>
        {done.length === 0 ? <p className="empty">Finished tasks appear here.</p>
          : <ul>{visibleDone.map(t => <TaskItem key={t.id} task={t} today={today} {...handlers} />)}</ul>}
        {!showAll && done.length > 10 && <button type="button" onClick={() => setShowAll(true)}>Show all {done.length}</button>}
      </section>
    </div>
  );
}
