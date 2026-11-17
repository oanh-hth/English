/* Merging two copies of the app's data (this device and the sync server). Pure, exposed on globalThis as LM.
   Rules: a newer epoch (reset or import) replaces everything; otherwise notes merge one by one, newest change wins,
   deletions are remembered; days, points and the garden never go backwards. */
(() => {
const max = (a, b) => Math.max(a || 0, b || 0);
const later = (a, b) => (!a ? b : !b ? a : a > b ? a : b);            // for 'YYYY-MM-DD' strings
const gardenRev = g => (g.done || []).length * 2 + (g.cur ? 1 : 0);  // planting and harvesting only ever move this up

function mergeItems(a, b, dead) {
  const map = new Map();
  for (const it of [...a, ...b]) { const cur = map.get(it.id); if (!cur || (it.u || 0) > (cur.u || 0)) map.set(it.id, it); }
  let items = [...map.values()].filter(it => !(dead[it.id] && dead[it.id] >= (it.u || 0)));
  // The same text added separately on two devices: keep the one studied more, forget the other.
  const byText = new Map();
  for (const it of items) { const k = it.text.trim().toLowerCase(), cur = byText.get(k); if (!cur) { byText.set(k, it); continue; } const keep = (it.reps || 0) > (cur.reps || 0) || ((it.reps || 0) === (cur.reps || 0) && (it.u || 0) > (cur.u || 0)) ? it : cur, drop = keep === it ? cur : it; byText.set(k, keep); dead[drop.id] = Date.now(); }
  items = items.filter(it => byText.get(it.text.trim().toLowerCase()) === it);
  return items.sort((x, y) => (y.c || 0) - (x.c || 0));                // newest first
}

function merge(a, b) {
  if (!b) return a; if (!a) return b;
  if ((a.epoch || 0) !== (b.epoch || 0)) return (a.epoch || 0) > (b.epoch || 0) ? a : b;
  const newer = (a.t || 0) >= (b.t || 0) ? a : b;
  const dead = { ...(a.dead || {}) }; for (const [k, v] of Object.entries(b.dead || {})) dead[k] = max(dead[k], v);
  const items = mergeItems(a.items || [], b.items || [], dead);
  const log = {};
  for (const day of new Set([...Object.keys(a.log || {}), ...Object.keys(b.log || {})])) { const x = (a.log || {})[day] || {}, y = (b.log || {})[day] || {}, o = {}; for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) o[k] = max(x[k], y[k]); log[day] = o; }
  const ga = a.garden || { done: [], bank: 0, cur: null }, gb = b.garden || { done: [], bank: 0, cur: null }, ra = gardenRev(ga), rb = gardenRev(gb);
  let garden;
  if (ra !== rb) garden = ra > rb ? ga : gb;
  else garden = { ...ga, bank: max(ga.bank, gb.bank), cur: ga.cur && gb.cur ? { ...ga.cur, gp: max(ga.cur.gp, gb.cur.gp) } : ga.cur || gb.cur };
  const ma = a.mission, mb = b.mission;
  const mission = !ma ? mb : !mb ? ma : ma.day !== mb.day ? (ma.day > mb.day ? ma : mb) : (ma.done ? ma : mb.done ? mb : newer.mission);
  const ba = a.backup || {}, bb = b.backup || {};
  return { ...newer, epoch: a.epoch || 0, items, dead, log, garden, mission, pts: max(a.pts, b.pts), t: max(a.t, b.t),
    settings: newer.settings, backup: { last: later(ba.last, bb.last) || null, snooze: later(ba.snooze, bb.snooze) || null, installTip: ba.installTip || bb.installTip } };
}
globalThis.LM = { merge, gardenRev };
})();
