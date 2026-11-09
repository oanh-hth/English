import type { AppState, ResourceKind, Task } from "@app/shared/types";
import { setResourceUsed } from "@app/shared/task-ops";

export type ResourceAction =
  | { type: "addResource"; id: string; name: string; kind: ResourceKind; url: string }
  | { type: "removeResource"; id: string }
  | { type: "attachResource"; taskId: string; resourceId: string }
  | { type: "detachResource"; taskId: string; resourceId: string }
  | { type: "markResourceUsed"; taskId: string; resourceId: string; used: boolean };

const onTask = (state: AppState, id: string, fn: (t: Task) => Task): AppState =>
  ({ ...state, tasks: state.tasks.map(t => (t.id === id ? fn(t) : t)) });

export function resourcesReducer(state: AppState, action: ResourceAction): AppState {
  switch (action.type) {
    case "addResource": {
      const name = action.name.trim();
      if (!name) return state;
      return { ...state, resources: [...state.resources, { id: action.id, name, kind: action.kind, url: action.url.trim() }] };
    }
    case "removeResource":
      return {
        ...state,
        resources: state.resources.filter(r => r.id !== action.id),
        tasks: state.tasks.map(t => (t.resources.some(r => r.resourceId === action.id) ? { ...t, resources: t.resources.filter(r => r.resourceId !== action.id) } : t)),
      };
    case "attachResource": {
      if (!state.resources.some(r => r.id === action.resourceId)) return state;
      const t = state.tasks.find(x => x.id === action.taskId);
      if (!t || t.resources.some(r => r.resourceId === action.resourceId)) return state;
      return onTask(state, action.taskId, x => ({ ...x, resources: [...x.resources, { resourceId: action.resourceId, used: false }] }));
    }
    case "detachResource":
      return onTask(state, action.taskId, x => ({ ...x, resources: x.resources.filter(r => r.resourceId !== action.resourceId) }));
    case "markResourceUsed":
      return onTask(state, action.taskId, x => setResourceUsed(x, action.resourceId, action.used));
    default:
      return state;
  }
}

export interface Usage { taskIds: string[]; usedIn: number }

export function resourceUsage(state: AppState): Record<string, Usage> {
  const out: Record<string, Usage> = {};
  for (const r of state.resources) out[r.id] = { taskIds: [], usedIn: 0 };
  for (const t of state.tasks) for (const r of t.resources) {
    const u = (out[r.resourceId] ??= { taskIds: [], usedIn: 0 });
    u.taskIds.push(t.id);
    if (r.used) u.usedIn++;
  }
  return out;
}
