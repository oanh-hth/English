import type { Day, Status, Task } from "@app/shared/types";

export function linkTasks(tasks: Task[], a: string, b: string): Task[] {
  if (a === b) return tasks;
  if (!tasks.some(t => t.id === a) || !tasks.some(t => t.id === b)) return tasks;
  return tasks.map(t => {
    if (t.id === a && !t.links.includes(b)) return { ...t, links: [...t.links, b] };
    if (t.id === b && !t.links.includes(a)) return { ...t, links: [...t.links, a] };
    return t;
  });
}

export function unlinkTasks(tasks: Task[], a: string, b: string): Task[] {
  return tasks.map(t => {
    if (t.id === a) return { ...t, links: t.links.filter(x => x !== b) };
    if (t.id === b) return { ...t, links: t.links.filter(x => x !== a) };
    return t;
  });
}

export function moveTask(tasks: Task[], id: string, status: Status, today: Day): Task[] {
  return tasks.map(t => {
    if (t.id !== id || t.status === status) return t;
    return { ...t, status, doneAt: status === "done" ? today : null };
  });
}

export function deleteTask(tasks: Task[], id: string): Task[] {
  return tasks.filter(t => t.id !== id).map(t => (t.links.includes(id) ? { ...t, links: t.links.filter(x => x !== id) } : t));
}

export function setResourceUsed(task: Task, resourceId: string, used: boolean): Task {
  const has = task.resources.some(r => r.resourceId === resourceId);
  const resources = has
    ? task.resources.map(r => (r.resourceId === resourceId ? { ...r, used } : r))
    : [...task.resources, { resourceId, used }];
  return { ...task, resources };
}
