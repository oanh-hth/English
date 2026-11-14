import { COMPLEXITIES, type Complexity, type Day, type Task } from "@app/shared/types";

export interface NewTaskOptions {
  complexity?: Complexity;
  due?: Day | null;
}

export function createTask(title: string, makeId: () => string, today: Day, options: NewTaskOptions = {}): Task {
  return {
    id: makeId(),
    title: title.trim() || "Untitled task",
    complexity: options.complexity ?? "simple",
    status: "todo",
    due: options.due ?? null,
    createdAt: today,
    doneAt: null,
    outcome: null,
  };
}

export function isComplexity(value: unknown): value is Complexity {
  return typeof value === "string" && (COMPLEXITIES as readonly string[]).includes(value);
}
