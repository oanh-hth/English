import type { Day, GardenState, Importance, PlantKind, Status, StreakState, Task } from "@app/shared/types";
import { initialGarden, gardenReducer } from "@app/shared/garden";
import { createTask } from "@app/shared/task-factory";
import { linkTasks, unlinkTasks, moveTask, deleteTask } from "@app/shared/task-ops";
import { growthFor, FOCUS_GROWTH } from "@app/shared/growth";
import { updateStreak } from "@app/shared/dates";

export interface AppState {
  tasks: Task[];
  garden: GardenState;
  streak: StreakState;
  focusSessions: number;
}

export type AppAction =
  | { type: "addTask"; id: string; title: string; today: Day }
  | { type: "rename"; id: string; title: string }
  | { type: "setImportance"; id: string; importance: Importance }
  | { type: "link"; a: string; b: string }
  | { type: "unlink"; a: string; b: string }
  | { type: "move"; id: string; status: Status; today: Day }
  | { type: "delete"; id: string }
  | { type: "focusDone" }
  | { type: "harvest"; day: Day }
  | { type: "chooseSeed"; kind: PlantKind }
  | { type: "replace"; state: AppState };

export const initialState: AppState = { tasks: [], garden: initialGarden, streak: { streak: 0, lastDone: null }, focusSessions: 0 };

const update = (tasks: Task[], id: string, fn: (t: Task) => Task) => tasks.map(t => (t.id === id ? fn(t) : t));

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "addTask":
      return { ...state, tasks: [createTask(action.title, () => action.id, action.today), ...state.tasks] };
    case "rename": {
      const title = action.title.trim();
      return title ? { ...state, tasks: update(state.tasks, action.id, t => ({ ...t, title })) } : state;
    }
    case "setImportance":
      return { ...state, tasks: update(state.tasks, action.id, t => ({ ...t, importance: action.importance })) };
    case "link":
      return { ...state, tasks: linkTasks(state.tasks, action.a, action.b) };
    case "unlink":
      return { ...state, tasks: unlinkTasks(state.tasks, action.a, action.b) };
    case "delete":
      return { ...state, tasks: deleteTask(state.tasks, action.id) };
    case "move": {
      const before = state.tasks.find(t => t.id === action.id);
      if (!before || before.status === action.status) return state;
      const tasks = moveTask(state.tasks, action.id, action.status, action.today);
      const amount = growthFor(before.importance);
      if (action.status === "done")
        return { ...state, tasks, garden: gardenReducer(state.garden, { type: "grow", amount }), streak: updateStreak(state.streak, action.today) };
      if (before.status === "done")
        return { ...state, tasks, garden: gardenReducer(state.garden, { type: "shrink", amount }) };
      return { ...state, tasks };
    }
    case "focusDone":
      return { ...state, focusSessions: state.focusSessions + 1, garden: gardenReducer(state.garden, { type: "grow", amount: FOCUS_GROWTH }) };
    case "harvest":
      return { ...state, garden: gardenReducer(state.garden, { type: "harvest", day: action.day }) };
    case "chooseSeed":
      return { ...state, garden: gardenReducer(state.garden, { type: "chooseSeed", kind: action.kind }) };
    case "replace":
      return action.state;
  }
}
