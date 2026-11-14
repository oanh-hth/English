// Shared test helpers.
import type { AppState, Outcome, Task } from "@app/shared/types";

export function task(id: string, extra: Partial<Task> = {}): Task {
  return { id, title: `Task ${id}`, complexity: "simple", status: "todo", due: null, createdAt: "2026-11-01", doneAt: null, outcome: null, ...extra };
}

export function outcome(extra: Partial<Outcome> = {}): Outcome {
  return { result: "Tried both", decision: "Use CSS Grid for the board", category: "layout", ...extra };
}

/** A finished complex task with an outcome. */
export function decided(id: string, doneAt: string, extra: Partial<Outcome> = {}, title = `Task ${id}`): Task {
  return task(id, { title, complexity: "complex", status: "done", doneAt, outcome: outcome(extra) });
}

/** Deep-freezes a value so any mutation throws. */
export function frozen<T>(value: T): T {
  if (value && typeof value === "object") { Object.values(value).forEach(frozen); Object.freeze(value); }
  return value;
}

export const state = (tasks: Task[] = []): AppState => frozen({ tasks });
