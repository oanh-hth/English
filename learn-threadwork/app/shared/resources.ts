// Exercise 5.3: Resources reducer and usage. Read curriculum/part-5/c-resources.md first.
import type { AppState, ResourceKind } from "@app/shared/types";
import { setResourceUsed } from "@app/shared/task-ops";

export type ResourceAction =
  | { type: "addResource"; id: string; name: string; kind: ResourceKind; url: string }
  | { type: "removeResource"; id: string }
  | { type: "attachResource"; taskId: string; resourceId: string }
  | { type: "detachResource"; taskId: string; resourceId: string }
  | { type: "markResourceUsed"; taskId: string; resourceId: string; used: boolean };

/**
 * - addResource: trim name and url; ignore it (same state) when the name is empty. Add at the end.
 * - removeResource: remove it from the library AND from every task's resources.
 * - attachResource: add { resourceId, used: false } to the task, unless it is already attached or unknown.
 * - detachResource: remove it from that task.
 * - markResourceUsed: use setResourceUsed from 1.3 on that task.
 * - anything else: the same state object.
 */
export function resourcesReducer(state: AppState, action: ResourceAction): AppState {
  // TODO 5.3
  return state;
}

export interface Usage { taskIds: string[]; usedIn: number }

/** For each resource id: the tasks it is attached to (in task order) and how many of them marked it used. */
export function resourceUsage(state: AppState): Record<string, Usage> {
  // TODO 5.3
  return {};
}
