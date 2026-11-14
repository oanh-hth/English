import type { AppState, Complexity, Day, Task } from "@app/shared/types";
import { createTask } from "@app/shared/task-factory";
import { parseOutcome } from "@app/shared/collections";
import { renameTask, setComplexity, completeSimple, recordOutcome, reopenTask, deleteTask } from "@app/shared/task-ops";

export type TaskAction =
  | { type: "add"; id: string; title: string; complexity: Complexity; due: Day | null; today: Day }
  | { type: "rename"; id: string; title: string }
  | { type: "setComplexity"; id: string; complexity: Complexity }
  | { type: "setDue"; id: string; due: Day | null }
  | { type: "complete"; id: string; today: Day }
  | { type: "recordOutcome"; id: string; outcome: unknown; today: Day }
  | { type: "reopen"; id: string }
  | { type: "delete"; id: string }
  | { type: "replace"; state: AppState };

export const initialState: AppState = { tasks: [] };

const withTasks = (state: AppState, tasks: Task[]): AppState => (tasks === state.tasks ? state : { ...state, tasks });

export function tasksReducer(state: AppState, action: TaskAction): AppState {
  switch (action.type) {
    case "add":
      return { ...state, tasks: [createTask(action.title, () => action.id, action.today, { complexity: action.complexity, due: action.due }), ...state.tasks] };
    case "rename":
      return withTasks(state, renameTask(state.tasks, action.id, action.title));
    case "setComplexity":
      return withTasks(state, setComplexity(state.tasks, action.id, action.complexity));
    case "setDue": {
      const t = state.tasks.find(x => x.id === action.id);
      if (!t || t.due === action.due) return state;
      return { ...state, tasks: state.tasks.map(x => (x.id === action.id ? { ...x, due: action.due } : x)) };
    }
    case "complete":
      return withTasks(state, completeSimple(state.tasks, action.id, action.today));
    case "recordOutcome": {
      const r = parseOutcome(action.outcome);
      return r.ok ? withTasks(state, recordOutcome(state.tasks, action.id, r.value, action.today)) : state;
    }
    case "reopen":
      return withTasks(state, reopenTask(state.tasks, action.id));
    case "delete":
      return withTasks(state, deleteTask(state.tasks, action.id));
    case "replace":
      return action.state;
    default:
      return state;
  }
}

export type { Task };
