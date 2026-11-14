import type { Complexity, Day, Outcome, Task } from "@app/shared/types";

const update = (tasks: Task[], id: string, fn: (t: Task) => Task): Task[] => {
  let changed = false;
  const out = tasks.map(t => { if (t.id !== id) return t; const n = fn(t); if (n !== t) changed = true; return n; });
  return changed ? out : tasks;
};

export function renameTask(tasks: Task[], id: string, title: string): Task[] {
  const t = title.trim();
  return t ? update(tasks, id, x => ({ ...x, title: t })) : tasks;
}

export function setComplexity(tasks: Task[], id: string, complexity: Complexity): Task[] {
  return update(tasks, id, x => (x.status === "todo" && x.complexity !== complexity ? { ...x, complexity } : x));
}

export function completeSimple(tasks: Task[], id: string, today: Day): Task[] {
  return update(tasks, id, x => (x.complexity === "simple" && x.status === "todo" ? { ...x, status: "done", doneAt: today } : x));
}

export function recordOutcome(tasks: Task[], id: string, outcome: Outcome, today: Day): Task[] {
  return update(tasks, id, x => (x.complexity === "complex" ? { ...x, status: "done", outcome: { ...outcome }, doneAt: x.doneAt ?? today } : x));
}

export function reopenTask(tasks: Task[], id: string): Task[] {
  return update(tasks, id, x => (x.status === "done" ? { ...x, status: "todo", doneAt: null } : x));
}

export function deleteTask(tasks: Task[], id: string): Task[] {
  return tasks.some(t => t.id === id) ? tasks.filter(t => t.id !== id) : tasks;
}
