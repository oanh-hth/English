// Shared test helpers.
import type { AppState, Task } from "@app/shared/types";
import { initialGarden } from "@app/shared/garden";

export function task(id: string, extra: Partial<Task> = {}): Task {
  return { id, title: `Task ${id}`, status: "inbox", importance: "medium", due: null, details: "",
    links: [], resources: [], createdAt: "2026-11-01", doneAt: null, ...extra };
}

/** Deep-freezes a value so any mutation throws. */
export function frozen<T>(value: T): T {
  if (value && typeof value === "object") { Object.values(value).forEach(frozen); Object.freeze(value); }
  return value;
}
export const deepFreeze = frozen;

export function appState(extra: Partial<AppState> = {}): AppState {
  return Object.freeze({ tasks: [], garden: initialGarden, streak: { streak: 0, lastDone: null }, focusSessions: 0,
    notes: [], resources: [], sketches: [], pins: [], treats: [], claimed: [], ...extra }) as AppState;
}
