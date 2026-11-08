// Tiny key-value store on IndexedDB (falls back to localStorage if IndexedDB is unavailable).
const NAME = "threadwork", STORE = "kv";
let opening = null;

function open() {
  if (!opening) {
    opening = new Promise((resolve, reject) => {
      const req = indexedDB.open(NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }).catch(() => null);
  }
  return opening;
}

function run(mode, fn) {
  return open().then(db => {
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const out = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(out && "result" in out ? out.result : undefined);
      tx.onerror = () => reject(tx.error);
    });
  });
}

const LS = "tw.kv.";
export async function get(key) {
  const db = await open();
  if (!db) { try { return JSON.parse(localStorage.getItem(LS + key)); } catch { return null; } }
  return run("readonly", s => s.get(key));
}
export async function set(key, value) {
  const db = await open();
  if (!db) { localStorage.setItem(LS + key, JSON.stringify(value)); return; }
  return run("readwrite", s => s.put(value, key));
}
export async function del(key) {
  const db = await open();
  if (!db) { localStorage.removeItem(LS + key); return; }
  return run("readwrite", s => s.delete(key));
}
export async function keys() {
  const db = await open();
  if (!db) return Object.keys(localStorage).filter(k => k.startsWith(LS)).map(k => k.slice(LS.length));
  return run("readonly", s => s.getAllKeys());
}
export async function clear() {
  const db = await open();
  if (!db) { Object.keys(localStorage).filter(k => k.startsWith(LS)).forEach(k => localStorage.removeItem(k)); return; }
  return run("readwrite", s => s.clear());
}
