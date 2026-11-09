// Exercise 3.4: TaskDrawer: edit, link and complete. Read curriculum/part-3/d-effects-and-editing.md first.
import type { ReactNode } from "react";
import type { Importance, Task } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

export interface TaskDrawerProps {
  task: Task;
  allTasks: Task[];
  onClose: () => void;
  onRename: (id: string, title: string) => void;
  onSetImportance: (id: string, importance: Importance) => void;
  onLink: (id: string, otherId: string) => void;
  onUnlink: (id: string, otherId: string) => void;
  onComplete: (id: string) => void;
  /** Extra content shown at the bottom (the app puts the attachments from Part 5 here). */
  children?: ReactNode;
}

/**
 * <aside role="dialog" aria-label="Task details"> containing:
 * - a "Close" button (and the Escape key) that calls onClose
 * - an input labelled "Title". Call onRename when it loses focus or on Enter, only if the trimmed
 *   value is non-empty and different. If empty, put the old title back.
 * - a select labelled "Importance" with options "Low · +8%", "Medium · +15%", "High · +25%", "Critical · +40%"
 *   (use GROWTH from @app/shared/growth). Changing it calls onSetImportance.
 * - a list of linked tasks; each has a button "Unlink <title>"
 * - a select labelled "Link to another task" with a first option "Choose a task…" (value "") and one option per
 *   task that is not this task and not already linked. Choosing one calls onLink, then resets to "".
 * - if not done: a button "Complete · +N% growth"; if done: the text "Finished on <doneAt>"
 * When the task prop changes to another task, the title input shows the new title.
 * Render `children` at the very end.
 */
export function TaskDrawer(props: TaskDrawerProps) {
  // TODO 3.4
  return <Todo exercise="3.4" what="Task details" />;
}
