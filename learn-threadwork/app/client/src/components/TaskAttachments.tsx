// Exercise 5.4: TaskAttachments in the drawer. Read curriculum/part-5/c-resources.md first.
import type { Note, Resource, Sketch, Task } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

export interface TaskAttachmentsProps {
  task: Task;
  resources: Resource[];        // the whole library
  notes: Note[];                // notes of this task
  sketches: Sketch[];           // sketches of this task
  onAttach: (resourceId: string) => void;
  onDetach: (resourceId: string) => void;
  onMarkUsed: (resourceId: string, used: boolean) => void;
  onOpenNote: (id: string) => void;
  onOpenSketch: (id: string) => void;
  onNewNote: (kind: "note" | "draft" | "table") => void;
}

/**
 * <section aria-label="Attachments">:
 * - <h3>Resources</h3>; for each attached resource: its name (a link with target="_blank" when it has a url),
 *   a checkbox labelled "Used <name>" (calls onMarkUsed), and a button "Remove <name>" (onDetach).
 *   With none attached: "No resources yet".
 * - a select labelled "Attach a resource": "Choose…" (value "") plus resources not attached yet. Choosing calls onAttach.
 * - <h3>Notes and sketches</h3>; a button per note (its title, or "Untitled note") calling onOpenNote, and per
 *   sketch (its title) calling onOpenSketch. Buttons "New note", "New draft", "New table" call onNewNote.
 */
export function TaskAttachments(props: TaskAttachmentsProps) {
  // TODO 5.4
  return <Todo exercise="5.4" what="Task attachments" />;
}
