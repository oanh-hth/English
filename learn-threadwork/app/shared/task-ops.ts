// Exercise 1.3: Link, move and delete tasks without mutation. Read curriculum/part-1/c-immutable-updates.md first.
// Every function returns NEW arrays/objects and leaves its inputs untouched.
import type { Day, Status, Task } from "@app/shared/types";

/** Links two tasks both ways. Ignores self-links, unknown ids and links that already exist. */
export function linkTasks(tasks: Task[], a: string, b: string): Task[] {
  // TODO 1.3
  throw new Error("TODO 1.3");
}

/** Removes the link between two tasks, both ways. */
export function unlinkTasks(tasks: Task[], a: string, b: string): Task[] {
  // TODO 1.3
  throw new Error("TODO 1.3");
}

/**
 * Moves a task to a status. Moving to "done" sets doneAt to `today`;
 * moving out of "done" sets doneAt back to null. Unknown ids return the list unchanged.
 */
export function moveTask(tasks: Task[], id: string, status: Status, today: Day): Task[] {
  // TODO 1.3
  throw new Error("TODO 1.3");
}

/** Removes a task and every link pointing to it. */
export function deleteTask(tasks: Task[], id: string): Task[] {
  // TODO 1.3
  throw new Error("TODO 1.3");
}

/** Marks an attached resource as used or not used. Attaches it first if needed. */
export function setResourceUsed(task: Task, resourceId: string, used: boolean): Task {
  // TODO 1.3
  throw new Error("TODO 1.3");
}
