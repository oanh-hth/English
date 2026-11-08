// Exercise 3.3: lists, keys and composing components. See curriculum/phase-3-react-components/3.3-board.md
import type { Day, Status, Task } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

export const COLUMNS: { status: Status; name: string }[] = [
  { status: "inbox", name: "Inbox" },
  { status: "doing", name: "Doing" },
  { status: "done", name: "Done" },
];

export interface BoardProps {
  tasks: Task[];
  today: Day;
  onOpen: (id: string) => void;
  onMove: (id: string, status: Status) => void;
}

/**
 * Three <section aria-label="Inbox|Doing|Done"> columns, in COLUMNS order. Each has:
 * - an <h2> with the column name and the number of tasks: "Inbox (3)"
 * - a <TaskCard> for each task in that status (use task.id as the key)
 * - under each card, one small button per OTHER column, text "→ Doing", aria-label "Move <title> to Doing",
 *   that calls onMove(task.id, status)
 * - "Nothing here" when the column is empty
 * Buttons instead of drag-and-drop work well with fingers and Apple Pencil.
 */
export function Board({ tasks, today, onOpen, onMove }: BoardProps) {
  // TODO 3.3
  return <Todo exercise="3.3" what="The task board" />;
}
