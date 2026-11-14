// Exercise 3.3: TaskList. Read curriculum/part-3/c-lists-and-composition.md first.
import type { Day, Task } from "@app/shared/types";
import type { TaskItemProps } from "@app/client/src/components/TaskItem";
import { Todo } from "@app/client/src/components/Todo";

export type TaskHandlers = Pick<TaskItemProps, "onComplete" | "onRecord" | "onReopen" | "onDelete">;

export interface TaskListProps extends TaskHandlers {
  tasks: Task[];
  today: Day;
}

/**
 * Two sections, in the order of sortTasks (1.4):
 * - <section aria-label="To do"> with <h2>"To do (N)"</h2> and a <ul> of TaskItem (3.1) for "todo" tasks,
 *   or "Nothing to do. Capture a task above." when there are none
 * - <section aria-label="Done"> with <h2>"Done (N)"</h2> and the done tasks. Show at most 10 at first;
 *   when there are more, a button "Show all N" shows them all (and then disappears).
 *   With none: "Finished tasks appear here."
 * Use task.id as key.
 */
export function TaskList(props: TaskListProps) {
  // TODO 3.3
  return <Todo exercise="3.3" what="The task list" />;
}
