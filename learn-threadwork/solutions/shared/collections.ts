import { STATUSES, type Result, type Status, type Task } from "@app/shared/types";
import { isImportance } from "@app/shared/task-factory";

export function groupBy<T, K extends PropertyKey>(items: readonly T[], keyOf: (item: T) => K, keys: readonly K[] = []): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const k of keys) out[k] = [];
  for (const item of items) {
    const k = keyOf(item);
    (out[k] ??= []).push(item);
  }
  return out;
}

export function sortByDue(tasks: readonly Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.due === b.due) return 0;
    if (a.due === null) return 1;
    if (b.due === null) return -1;
    return a.due < b.due ? -1 : 1;
  });
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isStatus = (v: unknown): v is Status => typeof v === "string" && (STATUSES as readonly string[]).includes(v);

export function parseTask(input: unknown): Result<Task> {
  if (!isRecord(input)) return { ok: false, error: "Task must be an object" };
  const { id, title, status, importance } = input;
  if (typeof id !== "string" || !id) return { ok: false, error: "id is required" };
  if (typeof title !== "string" || !title.trim()) return { ok: false, error: "title is required" };
  if (!isStatus(status)) return { ok: false, error: "status must be inbox, doing or done" };
  if (!isImportance(importance)) return { ok: false, error: "importance must be low, medium, high or critical" };
  return {
    ok: true,
    value: {
      id, title: title.trim(), status, importance,
      due: typeof input.due === "string" ? input.due : null,
      details: typeof input.details === "string" ? input.details : "",
      links: Array.isArray(input.links) ? input.links.filter((x): x is string => typeof x === "string") : [],
      resources: Array.isArray(input.resources) ? (input.resources as Task["resources"]) : [],
      createdAt: typeof input.createdAt === "string" ? input.createdAt : "1970-01-01",
      doneAt: typeof input.doneAt === "string" ? input.doneAt : null,
    },
  };
}
