// Exercise 3.1: TaskCard. Read curriculum/part-3/a-components-and-props.md first.
import type { Day, Task } from "@app/shared/types";
import { IMPORTANCE_LABEL, dueLabel } from "@app/client/src/format";
import { Todo } from "@app/client/src/components/Todo";

export interface TaskCardProps {
  task: Task;
  today: Day;
  onOpen: (id: string) => void;
}

/**
 * A button that shows one task:
 * - the title in an <h3>
 * - the importance label (IMPORTANCE_LABEL) in a <span className={`pill ${task.importance}`}>
 * - the due label from dueLabel() when there is one
 * - "N linked" when the task has links, "N resources" when it has resources ("1 resource" for one)
 * - data-status={task.status} on the button
 * Clicking it calls onOpen(task.id).
 */
export function TaskCard({ task, today, onOpen }: TaskCardProps) {
  // TODO 3.1: replace this placeholder
  return <Todo exercise="3.1" what="Task cards" />;
}
