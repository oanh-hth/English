// Exercise 2.4: The weekly summary. Read curriculum/part-2/c-queries.md first.
import type { Day, Task } from "@app/shared/types";

export interface Summary {
  open: number;               // tasks still "todo"
  overdue: number;            // "todo" tasks whose due day is before today
  doneToday: number;          // tasks with doneAt === today
  doneThisWeek: number;       // tasks done from this week's Monday to today (startOfWeek from 2.1)
  decisionsThisWeek: number;  // of those, the ones with an outcome
  topCategory: { id: string; count: number } | null;   // the most used category this week; ties: the one used first in the task list
}

export function weekSummary(tasks: readonly Task[], today: Day): Summary {
  // TODO 2.4
  throw new Error("TODO 2.4");
}
