// Saves app state on this device. Pictures (sketches, pinned images) are stored
// separately from the main state so the state stays small and quick to sync.
import * as db from "./db.js";

const imageList = S => [
  ...S.sketches.map(x => [x.id, "img", x]),
  ...S.inspo.filter(p => p.type === "image").map(p => [p.id, "src", p]),
];
const known = new Map();   // image id -> data URL last written

export function stripImages(S) {
  return JSON.parse(JSON.stringify(S, (k, v) => (k === "img" || k === "src") ? undefined : v));
}

export async function loadState() {
  const st = await db.get("state");
  if (!st) return null;
  for (const [id, field, obj] of imageList(st)) {
    obj[field] = (await db.get("img:" + id)) || "";
    if (obj[field]) known.set(id, obj[field]);
  }
  return st;
}

/** Saves state; returns the images that changed or were removed (for cloud sync). */
export async function saveState(S) {
  await db.set("state", stripImages(S));
  const changed = [], current = new Set();
  for (const [id, field, obj] of imageList(S)) {
    current.add(id);
    if (obj[field] && known.get(id) !== obj[field]) {
      await db.set("img:" + id, obj[field]); known.set(id, obj[field]); changed.push({ id, data: obj[field] });
    }
  }
  const removed = [];
  for (const id of [...known.keys()]) if (!current.has(id)) { await db.del("img:" + id); known.delete(id); removed.push(id); }
  return { changed, removed };
}

/** Fills in pictures for a state that came from the cloud: local copy first, then the fetcher. */
export async function attachImages(S, fetchRemote) {
  for (const [id, field, obj] of imageList(S)) {
    let data = known.get(id) || (await db.get("img:" + id));
    if (!data && fetchRemote) { data = await fetchRemote(id).catch(() => null); if (data) await db.set("img:" + id, data); }
    obj[field] = data || "";
    if (data) known.set(id, data);
  }
  return S;
}

export const getAccount = () => db.get("account");
export const setAccount = a => db.set("account", a);
export const wipeAll = async () => { known.clear(); await db.clear(); };
