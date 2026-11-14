// The rules of the app, as pure functions (the same rules the course builds in TypeScript).
import { CATEGORIES, GROUPS, categoryById, isCategoryId } from "./categories.js";
import { STICKERS } from "./art.js";

/* ---------- Days ("YYYY-MM-DD", computed in UTC) ---------- */
const toUtc = day => { const [y, m, d] = day.split("-").map(Number); return Date.UTC(y, m - 1, d); };
const fromUtc = ms => new Date(ms).toISOString().slice(0, 10);
export const addDays = (day, n) => fromUtc(toUtc(day) + n * 86_400_000);
export const daysBetween = (a, b) => Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
export const startOfWeek = day => addDays(day, -((new Date(toUtc(day)).getUTCDay() + 6) % 7));
/** Today in the device's own time zone. */
export const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function dueLabel(due, today) {
  if (!due) return "";
  const d = daysBetween(today, due);
  return d === 0 ? "Due today" : d === 1 ? "Due tomorrow" : d < 0 ? `${-d}d overdue` : `Due in ${d}d`;
}

/* ---------- Tasks ---------- */
export const createTask = (title, id, today, { complexity = "simple", due = null } = {}) =>
  ({ id, title: title.trim() || "Untitled task", complexity, status: "todo", due: due || null, createdAt: today, doneAt: null, outcome: null });

/** Checks an outcome from the form. Returns { ok, value } or { ok: false, error }. */
export function parseOutcome(input) {
  const t = v => (typeof v === "string" ? v.trim() : "");
  const result = t(input?.result), decision = t(input?.decision);
  if (!result) return { ok: false, error: "Write down the result" };
  if (!decision) return { ok: false, error: "Write down your decision" };
  if (!isCategoryId(input?.category)) return { ok: false, error: "Choose a category" };
  const sticker = STICKERS.some(st => st.id === input?.sticker) ? input.sticker : null;
  return { ok: true, value: { result, decision, category: input.category, sticker } };
}

const update = (tasks, id, fn) => tasks.map(t => (t.id === id ? fn(t) : t));
export const completeSimple = (tasks, id, today) => update(tasks, id, t => (t.complexity === "simple" && t.status === "todo" ? { ...t, status: "done", doneAt: today } : t));
export const recordOutcome = (tasks, id, outcome, today) => update(tasks, id, t => (t.complexity === "complex" ? { ...t, status: "done", outcome: { ...outcome }, doneAt: t.doneAt ?? today } : t));
export const reopenTask = (tasks, id) => update(tasks, id, t => ({ ...t, status: "todo", doneAt: null }));
export const setComplexity = (tasks, id, complexity) => update(tasks, id, t => (t.status === "todo" ? { ...t, complexity } : t));
export const renameTask = (tasks, id, title) => (title.trim() ? update(tasks, id, t => ({ ...t, title: title.trim() })) : tasks);
export const setDue = (tasks, id, due) => update(tasks, id, t => ({ ...t, due: due || null }));
export const deleteTask = (tasks, id) => tasks.filter(t => t.id !== id);

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === "todo" ? -1 : 1;
    if (a.status === "done") return cmp(b.doneAt ?? "", a.doneAt ?? "");
    if (a.due !== b.due) return a.due === null ? 1 : b.due === null ? -1 : cmp(a.due, b.due);
    return cmp(a.createdAt, b.createdAt);
  });
}

/* ---------- Decisions ---------- */
export function decisionsOf(tasks) {
  return tasks.filter(t => t.status === "done" && t.outcome && t.doneAt)
    .map(t => ({ taskId: t.id, title: t.title, doneAt: t.doneAt, ...t.outcome }))
    .sort((a, b) => cmp(b.doneAt, a.doneAt));
}
export function filterDecisions(decisions, { group = null, category = null, text = "" } = {}) {
  const q = text.trim().toLowerCase();
  return decisions.filter(d =>
    (!group || categoryById(d.category)?.group === group) &&
    (!category || d.category === category) &&
    (!q || [d.title, d.result, d.decision].some(s => s.toLowerCase().includes(q))));
}
export function countByCategory(decisions) {
  const out = {};
  for (const d of decisions) out[d.category] = (out[d.category] ?? 0) + 1;
  return out;
}

export function weekSummary(tasks, today) {
  const monday = startOfWeek(today);
  const open = tasks.filter(t => t.status === "todo");
  const week = tasks.filter(t => t.status === "done" && t.doneAt && t.doneAt >= monday && t.doneAt <= today);
  const decided = week.filter(t => t.outcome);
  const counts = new Map();
  for (const t of decided) counts.set(t.outcome.category, (counts.get(t.outcome.category) ?? 0) + 1);
  let top = null;
  for (const [id, count] of counts) if (!top || count > top.count) top = { id, count };
  return { open: open.length, overdue: open.filter(t => t.due && t.due < today).length, doneToday: tasks.filter(t => t.doneAt === today).length,
    doneThisWeek: week.length, decisionsThisWeek: decided.length, topCategory: top };
}

export function decisionsToMarkdown(decisions) {
  if (!decisions.length) return "# Decisions\n\nNo decisions yet.\n";
  const oneLine = s => s.replace(/\s*\n\s*/g, " ").trim();
  const lines = ["# Decisions", ""];
  const block = (heading, list) => {
    lines.push(`### ${heading}`, "");
    for (const d of list) lines.push(`- **${d.title}** (${d.doneAt})`, `  - Result: ${oneLine(d.result)}`, `  - Decision: ${oneLine(d.decision)}`);
    lines.push("");
  };
  for (const g of GROUPS) {
    const cats = CATEGORIES.filter(c => c.group === g && decisions.some(d => d.category === c.id));
    if (!cats.length) continue;
    lines.push(`## ${g}`, "");
    for (const c of cats) block(c.name, decisions.filter(d => d.category === c.id));
  }
  const known = new Set(CATEGORIES.map(c => c.id));
  const other = [...new Set(decisions.filter(d => !known.has(d.category)).map(d => d.category))];
  if (other.length) { lines.push("## Other", ""); for (const id of other) block(id, decisions.filter(d => d.category === id)); }
  return lines.join("\n").replace(/\n+$/, "") + "\n";
}

/** Older Threadwork data (tasks with importance and inbox/doing/done) becomes simple tasks. */
export function migrateTasks(tasks = []) {
  return tasks.map(t => ("complexity" in t ? t : {
    id: t.id, title: t.title || "Untitled task", complexity: "simple", status: t.status === "done" ? "done" : "todo",
    due: t.due || null, createdAt: t.createdAt || todayKey(), doneAt: t.status === "done" ? (t.doneAt || null) : null, outcome: null,
  }));
}

/* ---------- Folders: one per category that has decisions ---------- */
/** Shelf order: groups in GROUPS order, categories in list order, unknown categories last.
 *  stickers: the distinct stickers of the folder's decisions, newest first, at most 3. */
export function foldersOf(decisions) {
  const ids = [...CATEGORIES.map(c => c.id), ...new Set(decisions.map(d => d.category).filter(id => !categoryById(id)))];
  return ids.map(id => {
    const list = decisions.filter(d => d.category === id);
    if (!list.length) return null;
    const c = categoryById(id);
    return { category: id, name: c?.name ?? id, group: c?.group ?? "Other", count: list.length, latest: list[0].doneAt,
      stickers: [...new Set(list.map(d => d.sticker).filter(Boolean))].slice(0, 3), decisions: list };
  }).filter(Boolean);
}
