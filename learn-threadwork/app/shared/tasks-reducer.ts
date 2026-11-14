// Exercise 2.2: The tasks reducer. Read curriculum/part-2/b-reducers.md first.
import type { AppState, Complexity, Day, Task } from "@app/shared/types";
import { createTask } from "@app/shared/task-factory";
import { parseOutcome } from "@app/shared/collections";

export type TaskAction =
  | { type: "add"; id: string; title: string; complexity: Complexity; due: Day | null; today: Day }
  | { type: "rename"; id: string; title: string }
  | { type: "setComplexity"; id: string; complexity: Complexity }
  | { type: "setDue"; id: string; due: Day | null }
  | { type: "complete"; id: string; today: Day }                       // simple tasks
  | { type: "recordOutcome"; id: string; outcome: unknown; today: Day } // complex tasks; outcome comes from a form
  | { type: "reopen"; id: string }
  | { type: "delete"; id: string }
  | { type: "replace"; state: AppState };                             // data from the server or a backup

export const initialState: AppState = { tasks: [] };

/**
 * - add: createTask (1.1) with the action's id, at the START of the list
 * - rename / setComplexity / complete / reopen / delete: your functions from 1.3
 * - setDue: change that task's due day
 * - recordOutcome: check action.outcome with parseOutcome (1.4). Invalid: the same state. Valid: recordOutcome (1.3).
 * - replace: action.state
 * When nothing changes, return the SAME state object.
 */
export function tasksReducer(state: AppState, action: TaskAction): AppState {
  // TODO 2.2
  throw new Error("TODO 2.2");
}

export type { Task };
