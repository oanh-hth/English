// Exercise 5.1: Notes, drafts and tables reducer. Read curriculum/part-5/a-feature-reducers.md first.
import type { AppState, Day, NoteKind } from "@app/shared/types";
import { createTask } from "@app/shared/task-factory";

export type NoteAction =
  | { type: "addNote"; id: string; kind: NoteKind; taskId: string | null; now: number }
  | { type: "editNote"; id: string; title?: string; body?: string; now: number }
  | { type: "setCell"; id: string; row: number; col: number; value: string; now: number }
  | { type: "addRow"; id: string; now: number }
  | { type: "addColumn"; id: string; now: number }
  | { type: "linkNote"; id: string; taskId: string | null }
  | { type: "deleteNote"; id: string }
  | { type: "noteToTask"; id: string; taskId: string; today: Day }
  | { type: "delete"; id: string };       // a TASK was deleted (handled by 4.2 too)

/** The empty table a new "table" note starts with. */
export const NEW_TABLE = [["Item", "Value", "Note"], ["", "", ""], ["", "", ""]];

/**
 * - addNote: add at the END. Empty title and body; rows = a fresh copy of NEW_TABLE for "table", else []; updatedAt = now.
 * - editNote: change title and/or body (only the ones given), set updatedAt.
 * - setCell / addRow / addColumn: edit the table. addRow adds a row of "" as wide as the header. addColumn adds
 *   "Column" to the header and "" to every other row. Ignore cells outside the table. Set updatedAt.
 * - linkNote: set taskId (null unlinks). deleteNote: remove it.
 * - noteToTask: create a task (createTask from 1.1, id = action.taskId) with title = the note title, or the first
 *   non-empty line of the body, or "From note"; details = body. Add the task to the START of tasks and link the note to it.
 * - delete (a task was deleted): notes that belonged to it get taskId null.
 * - anything else: return state unchanged (the same object).
 */
export function notesReducer(state: AppState, action: NoteAction): AppState {
  // TODO 5.1
  return state;
}
