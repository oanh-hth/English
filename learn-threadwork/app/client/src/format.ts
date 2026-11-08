// Given: small display helpers used by the components.
import type { Day, Importance } from "@app/shared/types";

export const IMPORTANCE_LABEL: Record<Importance, string> = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };

export function dueLabel(due: Day | null, today: Day): string {
  if (!due) return "";
  const diff = Math.round((Date.parse(due) - Date.parse(today)) / 86_400_000);
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff < 0) return `${-diff}d overdue`;
  return `Due in ${diff}d`;
}

export const todayKey = (d = new Date()): Day =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
