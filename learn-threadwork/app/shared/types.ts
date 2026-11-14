// The Threadwork data model. This file is given: read it in Part 1, don't change it.

/** A calendar day as "YYYY-MM-DD". Strings like this compare correctly with < and >. */
export type Day = string;

export const COMPLEXITIES = ["simple", "complex"] as const;
/** simple: just tick it done. complex: when it's done, record the result and your decision. */
export type Complexity = (typeof COMPLEXITIES)[number];

export const STATUSES = ["todo", "done"] as const;
export type Status = (typeof STATUSES)[number];

/** What you learned from a complex task, and what you decided. */
export interface Outcome {
  result: string;        // what happened, what you found out
  decision: string;      // what you decided, and why
  category: string;      // a category id from CATEGORIES (categories.ts)
}

export interface Task {
  id: string;
  title: string;
  complexity: Complexity;
  status: Status;
  due: Day | null;
  createdAt: Day;
  doneAt: Day | null;
  outcome: Outcome | null;   // only complex tasks have one, once they are done
}

/** The whole app state. */
export interface AppState {
  tasks: Task[];
}

/** Either a value or an error message. Used instead of throwing for problems you expect. */
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
