// Exercise 4.2: one reducer for the whole app. See curriculum/phase-4-state-and-hooks/4.2-app-reducer.md
// It combines what you built in Phases 1 and 2.
import type { Day, GardenState, Importance, PlantKind, Status, StreakState, Task } from "@app/shared/types";
import { initialGarden } from "@app/shared/garden";

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

/**
 * - addTask: createTask (1.1), added to the START of the list
 * - rename / setImportance: change that one task (ignore empty titles)
 * - link / unlink / delete: use your functions from 1.3
 * - move: moveTask (1.3). When a task becomes done: grow the garden by growthFor(importance) (1.2, 2.2)
 *   and update the streak (2.1). When a done task moves back: shrink by the same amount (streak unchanged).
 * - focusDone: focusSessions + 1 and grow by FOCUS_GROWTH
 * - harvest / chooseSeed: pass to gardenReducer (2.2)
 * - replace: return action.state
 */
export function appReducer(state: AppState, action: AppAction): AppState {
  // TODO 4.2
  throw new Error("TODO 4.2");
}
