import type { Day, Task } from "@app/shared/types";
import { categoryById, type Group } from "@app/shared/categories";

export interface Decision { taskId: string; title: string; doneAt: Day; result: string; decision: string; category: string }

export function decisionsOf(tasks: readonly Task[]): Decision[] {
  return tasks
    .filter(t => t.status === "done" && t.outcome && t.doneAt)
    .map(t => ({ taskId: t.id, title: t.title, doneAt: t.doneAt!, ...t.outcome! }))
    .sort((a, b) => (a.doneAt === b.doneAt ? 0 : a.doneAt < b.doneAt ? 1 : -1));
}

export interface DecisionFilter { group?: Group | null; category?: string | null; text?: string }

export function filterDecisions(decisions: readonly Decision[], filter: DecisionFilter): Decision[] {
  const q = (filter.text ?? "").trim().toLowerCase();
  return decisions.filter(d =>
    (!filter.group || categoryById(d.category)?.group === filter.group) &&
    (!filter.category || d.category === filter.category) &&
    (!q || [d.title, d.result, d.decision].some(s => s.toLowerCase().includes(q))));
}

export function countByCategory(decisions: readonly Decision[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const d of decisions) out[d.category] = (out[d.category] ?? 0) + 1;
  return out;
}
