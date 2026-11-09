import type { AppState, Day, Note, NoteKind } from "@app/shared/types";
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
  | { type: "delete"; id: string };

export const NEW_TABLE = [["Item", "Value", "Note"], ["", "", ""], ["", "", ""]];

const edit = (state: AppState, id: string, fn: (n: Note) => Note): AppState =>
  ({ ...state, notes: state.notes.map(n => (n.id === id ? fn(n) : n)) });

export function notesReducer(state: AppState, action: NoteAction): AppState {
  switch (action.type) {
    case "addNote": {
      const note: Note = { id: action.id, kind: action.kind, title: "", body: "", taskId: action.taskId, updatedAt: action.now,
        rows: action.kind === "table" ? NEW_TABLE.map(r => [...r]) : [] };
      return { ...state, notes: [...state.notes, note] };
    }
    case "editNote":
      return edit(state, action.id, n => ({ ...n, title: action.title ?? n.title, body: action.body ?? n.body, updatedAt: action.now }));
    case "setCell":
      return edit(state, action.id, n => {
        if (action.row < 0 || action.row >= n.rows.length || action.col < 0 || action.col >= (n.rows[0]?.length ?? 0)) return n;
        return { ...n, updatedAt: action.now, rows: n.rows.map((r, i) => (i === action.row ? r.map((c, j) => (j === action.col ? action.value : c)) : r)) };
      });
    case "addRow":
      return edit(state, action.id, n => ({ ...n, updatedAt: action.now, rows: [...n.rows, (n.rows[0] ?? []).map(() => "")] }));
    case "addColumn":
      return edit(state, action.id, n => ({ ...n, updatedAt: action.now, rows: n.rows.map((r, i) => [...r, i === 0 ? "Column" : ""]) }));
    case "linkNote":
      return edit(state, action.id, n => ({ ...n, taskId: action.taskId }));
    case "deleteNote":
      return { ...state, notes: state.notes.filter(n => n.id !== action.id) };
    case "noteToTask": {
      const note = state.notes.find(n => n.id === action.id);
      if (!note) return state;
      const firstLine = note.body.split("\n").map(l => l.trim()).find(Boolean);
      const task = createTask(note.title.trim() || firstLine || "From note", () => action.taskId, action.today, { details: note.body });
      return edit({ ...state, tasks: [task, ...state.tasks] }, note.id, n => ({ ...n, taskId: task.id }));
    }
    case "delete":
      return state.notes.some(n => n.taskId === action.id)
        ? { ...state, notes: state.notes.map(n => (n.taskId === action.id ? { ...n, taskId: null } : n)) }
        : state;
    default:
      return state;
  }
}
