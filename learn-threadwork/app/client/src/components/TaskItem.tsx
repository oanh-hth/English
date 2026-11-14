// Exercise 3.1: TaskItem. Read curriculum/part-3/a-components-and-props.md first.
import type { Day, Task } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

export interface TaskItemProps {
  task: Task;
  today: Day;
  onComplete: (id: string) => void;   // simple task ticked
  onRecord: (id: string) => void;     // open the outcome form (complex task)
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * An <li data-status={task.status} data-complexity={task.complexity}> with:
 * - the title in a <span className="title">
 * - a pill "Complex" for complex tasks
 * - the due label (dueLabel from 2.1) when the task is todo and has a due day
 * - todo + simple: a checkbox labelled "Done: <title>" that calls onComplete
 * - todo + complex: a button "Record result" with aria-label "Record result for <title>" (onRecord)
 * - done: the text "Done <doneAt>"; with an outcome also the category NAME (categoryById from 1.2)
 *   and the decision text, a button "Edit result" (aria-label "Edit result for <title>", onRecord),
 *   and for every done task a button "Reopen" (aria-label "Reopen <title>", onReopen)
 * - always: a button "Delete" with aria-label "Delete <title>" (onDelete)
 */
export function TaskItem(props: TaskItemProps) {
  // TODO 3.1
  return <Todo exercise="3.1" what="Task items" />;
}
