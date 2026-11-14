import { STATUSES, type Outcome, type Result, type Status, type Task } from "@app/shared/types";
import { isComplexity } from "@app/shared/task-factory";
import { isCategoryId } from "@app/shared/categories";

export function groupBy<T, K extends PropertyKey>(items: readonly T[], keyOf: (item: T) => K, keys: readonly K[] = []): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const k of keys) out[k] = [];
  for (const item of items) (out[keyOf(item)] ??= []).push(item);
  return out;
}

const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export function sortTasks(tasks: readonly Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === "todo" ? -1 : 1;
    if (a.status === "done") return cmp(b.doneAt ?? "", a.doneAt ?? "");
    if (a.due !== b.due) return a.due === null ? 1 : b.due === null ? -1 : cmp(a.due, b.due);
    return cmp(a.createdAt, b.createdAt);
  });
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function parseOutcome(input: unknown): Result<Outcome> {
  if (!isRecord(input)) return { ok: false, error: "Outcome must be an object" };
  const result = text(input.result), decision = text(input.decision);
  if (!result) return { ok: false, error: "Write down the result" };
  if (!decision) return { ok: false, error: "Write down your decision" };
  if (!isCategoryId(input.category)) return { ok: false, error: "Choose a category" };
  return { ok: true, value: { result, decision, category: input.category } };
}

const isStatus = (v: unknown): v is Status => typeof v === "string" && (STATUSES as readonly string[]).includes(v);

export function parseTask(input: unknown): Result<Task> {
  if (!isRecord(input)) return { ok: false, error: "Task must be an object" };
  const { id, title, complexity, status } = input;
  if (typeof id !== "string" || !id) return { ok: false, error: "id is required" };
  if (!text(title)) return { ok: false, error: "title is required" };
  if (!isComplexity(complexity)) return { ok: false, error: "complexity must be simple or complex" };
  if (!isStatus(status)) return { ok: false, error: "status must be todo or done" };
  let outcome: Outcome | null = null;
  if (input.outcome !== undefined && input.outcome !== null) {
    const r = parseOutcome(input.outcome);
    if (!r.ok) return r;
    outcome = r.value;
  }
  return { ok: true, value: { id, title: text(title), complexity, status,
    due: typeof input.due === "string" ? input.due : null,
    createdAt: typeof input.createdAt === "string" ? input.createdAt : "1970-01-01",
    doneAt: typeof input.doneAt === "string" ? input.doneAt : null, outcome } };
}
