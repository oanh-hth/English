// Exercise 4.6: todayModel: what the Today page shows. Read curriculum/part-4/c-navigation-and-selectors.md first.
import type { AppState, Day, Task } from "@app/shared/types";

export interface TodayModel {
  greeting: "Good morning" | "Good afternoon" | "Good evening";   // hour < 12, < 18, else
  due: Task[];          // not-done tasks due today, tomorrow or earlier (overdue), earliest first
  inbox: Task[];        // inbox tasks that are not in `due`, in their current order
  doneToday: number;    // tasks whose doneAt is today
  goal: number;         // max(3, doneToday + number of not-done tasks due today or earlier)
  progress: number;     // doneToday / goal, at most 1
}

/** Use addDays from 2.1 for "tomorrow". */
export function todayModel(state: AppState, today: Day, hour: number): TodayModel {
  // TODO 4.6
  throw new Error("TODO 4.6");
}
