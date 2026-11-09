// Exercise 5.2: NoteEditor. Read curriculum/part-5/b-editors.md first.
import type { Note, Task } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

export interface NoteEditorProps {
  note: Note;
  tasks: Task[];
  onEdit: (patch: { title?: string; body?: string }) => void;
  onSetCell: (row: number, col: number, value: string) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  onLink: (taskId: string | null) => void;
  onToTask: () => void;
  onDelete: () => void;
}

/**
 * <section aria-label="Note editor"> with:
 * - an input labelled "Title" (placeholder "Untitled"); every change calls onEdit({ title })
 * - a select labelled "Task" with "No task" (value "") and one option per task; changing calls onLink(id or null)
 * - kind "note" or "draft": a textarea labelled "Text"; changes call onEdit({ body })
 * - kind "table": a <table>; every cell is an input labelled "Row R, column C" (1-based) calling onSetCell(r, c, value)
 *   with 0-based numbers; and buttons "Add row" and "Add column"
 * - kind "note" only: a button "Turn into task" (onToTask)
 * - a button "Delete note" (onDelete)
 */
export function NoteEditor(props: NoteEditorProps) {
  // TODO 5.2
  return <Todo exercise="5.2" what="The note editor" />;
}
