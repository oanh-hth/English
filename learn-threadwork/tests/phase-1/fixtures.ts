import type { Task } from "@app/shared/types";

export function task(id: string, extra: Partial<Task> = {}): Task {
  return { id, title: `Task ${id}`, status: "inbox", importance: "medium", due: null, details: "",
    links: [], resources: [], createdAt: "2026-11-01", doneAt: null, ...extra };
}
/** Deep-freezes a value so any mutation throws in strict mode. */
export function frozen<T>(value: T): T {
  if (value && typeof value === "object") { Object.values(value).forEach(frozen); Object.freeze(value); }
  return value;
}
