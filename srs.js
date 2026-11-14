/* Spaced-repetition scheduler. Pure functions, no DOM. Exposed as globalThis.SRS.
   Days are 'YYYY-MM-DD' strings. An item is { id, stage, due, last, lapses, ... }. */
(() => {
const INTERVALS = [1, 3, 7, 14, 30, 60, 120];       // days to wait after reaching each stage
const MAX_STAGE = INTERVALS.length - 1;
const pad = n => String(n).padStart(2, '0');
const num = key => { const [y, m, d] = key.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); };
const key = n => { const d = new Date(n * 864e5); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
const addDays = (k, n) => key(num(k) + n);
const diff = (a, b) => num(a) - num(b);             // a - b in days

/* First day on or after `target` that has fewer than `cap` items due. `except` is the item being moved. */
function place(items, target, cap, except) {
  const load = new Map();
  for (const it of items) if (it !== except && it.due) load.set(it.due, (load.get(it.due) || 0) + 1);
  let n = num(target);
  while ((load.get(key(n)) || 0) >= Math.max(1, cap)) n++;
  return key(n);
}

/* Call when a new item is saved: first review is tomorrow, or the next day with room. */
function schedule(items, item, today, cap) {
  item.stage = 0; item.lapses = 0; item.reps = 0; item.last = null;
  item.due = place(items, addDays(today, INTERVALS[0]), cap, item);
  return item;
}

/* grade: 0 again, 1 hard, 2 good, 3 easy. Returns the number of days until the next review. */
function review(items, item, grade, today, cap) {
  let days;
  if (grade === 0) { item.stage = 0; item.lapses = (item.lapses || 0) + 1; days = 1; }
  else if (grade === 1) { days = Math.max(1, Math.round(INTERVALS[item.stage] * 0.7)); }
  else { item.stage = Math.min(MAX_STAGE, item.stage + (grade === 3 ? 2 : 1)); days = INTERVALS[item.stage]; }
  item.reps = (item.reps || 0) + 1; item.last = today;
  item.due = place(items, addDays(today, days), cap, item);
  return diff(item.due, today);
}

/* A wrong answer in an exercise: bring the item back sooner if it was scheduled far away. */
function slip(items, item, today, cap) {
  if (diff(item.due, today) <= 1) return;
  item.stage = Math.max(0, item.stage - 1);
  item.due = place(items, addDays(today, 1), cap, item);
}

/* What the next interval would be for each grade (shown on the grade buttons). */
function preview(item) {
  return [1, Math.max(1, Math.round(INTERVALS[item.stage] * 0.7)), INTERVALS[Math.min(MAX_STAGE, item.stage + 1)], INTERVALS[Math.min(MAX_STAGE, item.stage + 2)]];
}

const dueItems = (items, today) => items.filter(i => i.due && diff(i.due, today) <= 0).sort((a, b) => num(a.due) - num(b.due) || a.stage - b.stage);

/* Upcoming reviews grouped by day, for the next `span` days (excludes today and overdue). */
function upcoming(items, today, span = 14) {
  const map = new Map();
  for (const i of items) { const d = diff(i.due, today); if (d > 0 && d <= span) { if (!map.has(i.due)) map.set(i.due, []); map.get(i.due).push(i); } }
  return [...map.entries()].sort((a, b) => num(a[0]) - num(b[0])).map(([day, list]) => ({ day, items: list }));
}
const nextAfter = (items, today) => { const f = items.filter(i => diff(i.due, today) > 0).sort((a, b) => num(a.due) - num(b.due))[0]; return f ? f.due : null; };

const level = stage => stage >= 5 ? 'Known' : stage >= 3 ? 'Familiar' : stage >= 1 ? 'Learning' : 'New';
const whenLabel = (dueKey, today) => {
  const d = diff(dueKey, today);
  if (d < 0) return d === -1 ? 'Overdue 1 day' : `Overdue ${-d} days`;
  if (d === 0) return 'Today'; if (d === 1) return 'Tomorrow'; if (d < 7) return `In ${d} days`; if (d < 30) return `In ${Math.round(d / 7)} wk`; return `In ${Math.round(d / 30)} mo`;
};

globalThis.SRS = { INTERVALS, MAX_STAGE, num, key, addDays, diff, place, schedule, review, slip, preview, dueItems, upcoming, nextAfter, level, whenLabel };
})();
