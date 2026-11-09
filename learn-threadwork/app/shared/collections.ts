// Exercise 1.4: groupBy, sorting and parsing unknown data. Read curriculum/part-1/d-generics-and-unknown.md first.
import { STATUSES, type Result, type Task } from "@app/shared/types";
import { isImportance } from "@app/shared/task-factory";

/** Groups items by a key. Keys listed in `keys` always exist, even with no items. */
export function groupBy<T, K extends PropertyKey>(items: readonly T[], keyOf: (item: T) => K, keys: readonly K[] = []): Record<K, T[]> {
  // TODO 1.4
  throw new Error("TODO 1.4");
}

/** Sorts tasks by due day (earliest first). Tasks without a due day go last. Returns a new array. */
export function sortByDue(tasks: readonly Task[]): Task[] {
  // TODO 1.4
  throw new Error("TODO 1.4");
}

/**
 * Checks data that came from outside (a request body, a file) and returns a Task or an error.
 * Required: id (non-empty string), title (non-empty string after trim), status (one of STATUSES),
 * importance (use isImportance). Optional with defaults: due null, details "", links [], resources [],
 * createdAt "1970-01-01", doneAt null.
 * Error messages: "Task must be an object", "id is required", "title is required",
 * "status must be inbox, doing or done", "importance must be low, medium, high or critical".
 */
export function parseTask(input: unknown): Result<Task> {
  // TODO 1.4
  throw new Error("TODO 1.4");
}
