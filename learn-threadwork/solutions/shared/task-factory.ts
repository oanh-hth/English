import { IMPORTANCE, type Importance, type Day, type Task } from "@app/shared/types";

export interface NewTaskOptions {
  importance?: Importance;
  due?: Day | null;
  details?: string;
}

export function createTask(title: string, makeId: () => string, today: Day, options: NewTaskOptions = {}): Task {
  return {
    id: makeId(),
    title: title.trim() || "Untitled task",
    status: "inbox",
    importance: options.importance ?? "medium",
    due: options.due ?? null,
    details: options.details ?? "",
    links: [],
    resources: [],
    createdAt: today,
    doneAt: null,
  };
}

export function isImportance(value: unknown): value is Importance {
  return typeof value === "string" && (IMPORTANCE as readonly string[]).includes(value);
}
