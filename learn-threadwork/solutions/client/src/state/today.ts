import type { AppState, Day, Task } from "@app/shared/types";
import { addDays } from "@app/shared/dates";

export interface TodayModel {
  greeting: "Good morning" | "Good afternoon" | "Good evening";
  due: Task[];
  inbox: Task[];
  doneToday: number;
  goal: number;
  progress: number;
}

export function todayModel(state: AppState, today: Day, hour: number): TodayModel {
  const tomorrow = addDays(today, 1);
  const open = state.tasks.filter(t => t.status !== "done");
  const due = open.filter(t => t.due !== null && t.due <= tomorrow).sort((a, b) => (a.due! < b.due! ? -1 : a.due! > b.due! ? 1 : 0));
  const inbox = open.filter(t => t.status === "inbox" && !due.includes(t));
  const doneToday = state.tasks.filter(t => t.doneAt === today).length;
  const goal = Math.max(3, doneToday + open.filter(t => t.due !== null && t.due <= today).length);
  return {
    greeting: hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening",
    due, inbox, doneToday, goal, progress: Math.min(1, doneToday / goal),
  };
}
