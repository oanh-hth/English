import type { Day, Task } from "@app/shared/types";
import { startOfWeek } from "@app/shared/dates";

export interface Summary {
  open: number; overdue: number; doneToday: number; doneThisWeek: number; decisionsThisWeek: number;
  topCategory: { id: string; count: number } | null;
}

export function weekSummary(tasks: readonly Task[], today: Day): Summary {
  const monday = startOfWeek(today);
  const open = tasks.filter(t => t.status === "todo");
  const week = tasks.filter(t => t.status === "done" && t.doneAt !== null && t.doneAt >= monday && t.doneAt <= today);
  const decided = week.filter(t => t.outcome);
  const counts = new Map<string, number>();
  for (const t of decided) counts.set(t.outcome!.category, (counts.get(t.outcome!.category) ?? 0) + 1);
  let topCategory: Summary["topCategory"] = null;
  for (const [id, count] of counts) if (!topCategory || count > topCategory.count) topCategory = { id, count };
  return {
    open: open.length,
    overdue: open.filter(t => t.due !== null && t.due < today).length,
    doneToday: tasks.filter(t => t.doneAt === today).length,
    doneThisWeek: week.length,
    decisionsThisWeek: decided.length,
    topCategory,
  };
}
