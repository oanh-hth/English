// Optional sync between devices using your own Firebase project (Auth + Firestore).
// Nothing here runs until you paste your Firebase web config in Settings → Sync.
// Data layout:  users/{uid}/app/state   { json, rev, device, at }
//               users/{uid}/images/{id} { data }   (one picture per document)
const VERSION = "10.12.2";
const BASE = `https://www.gstatic.com/firebasejs/${VERSION}/`;
const CFG = "tw.firebase";

let F = null, app = null, auth = null, fs = null;

export const deviceId = (() => {
  try {
    let id = localStorage.getItem("tw.device");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("tw.device", id); }
    return id;
  } catch { return "device-" + Math.random().toString(36).slice(2); }
})();

export function getConfig() { try { return JSON.parse(localStorage.getItem(CFG)); } catch { return null; } }
export function setConfig(cfg) { try { cfg ? localStorage.setItem(CFG, JSON.stringify(cfg)) : localStorage.removeItem(CFG); } catch {} }

/** Accepts the snippet Firebase shows (`const firebaseConfig = {...}`) or plain JSON. */
export function parseConfig(text) {
  const pick = k => (text.match(new RegExp(`["']?${k}["']?\\s*:\\s*["']([^"']+)["']`)) || [])[1];
  const cfg = {};
  for (const k of ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]) { const v = pick(k); if (v) cfg[k] = v; }
  return cfg.apiKey && cfg.projectId && cfg.appId ? cfg : null;
}

export const enabled = () => !!getConfig();

export async function init() {
  if (app) return true;
  const cfg = getConfig();
  if (!cfg) return false;
  const [A, Au, Fs] = await Promise.all([
    import(BASE + "firebase-app.js"), import(BASE + "firebase-auth.js"), import(BASE + "firebase-firestore.js"),
  ]);
  F = { ...Au, ...Fs };
  app = A.initializeApp(cfg);
  auth = Au.getAuth(app);
  await Au.setPersistence(auth, Au.browserLocalPersistence);
  fs = Fs.getFirestore(app);
  return true;
}

export const user = () => auth?.currentUser || null;
export const onUser = cb => F.onAuthStateChanged(auth, cb);
export const signIn = (email, pw) => F.signInWithEmailAndPassword(auth, email, pw);
export const signUp = (email, pw) => F.createUserWithEmailAndPassword(auth, email, pw);
export const resetPassword = email => F.sendPasswordResetEmail(auth, email);
export const signOut = () => auth && F.signOut(auth);

const stateRef = () => F.doc(fs, "users", user().uid, "app", "state");
const imageRef = id => F.doc(fs, "users", user().uid, "images", id);

export async function readState() {
  const snap = await F.getDoc(stateRef());
  return snap.exists() ? snap.data() : null;
}

export async function push(stateJson, rev, changed = [], removed = []) {
  if (!user()) return;
  if (stateJson.length > 900000) throw new Error("Your data is close to the 1 MB sync limit for one document.");
  for (const im of changed) await F.setDoc(imageRef(im.id), { data: im.data });
  for (const id of removed) await F.deleteDoc(imageRef(id)).catch(() => {});
  await F.setDoc(stateRef(), { json: stateJson, rev, device: deviceId, at: F.serverTimestamp() });
}

/** Calls back when another device saves a newer state. Returns an unsubscribe function. */
export function watch(cb) {
  return F.onSnapshot(stateRef(), snap => {
    if (!snap.exists() || snap.metadata.hasPendingWrites) return;
    const d = snap.data();
    if (d.device !== deviceId) cb(d);
  });
}

export async function fetchImage(id) {
  const snap = await F.getDoc(imageRef(id));
  return snap.exists() ? snap.data().data : null;
}

export async function pushAllImages(list) {
  for (const im of list) await F.setDoc(imageRef(im.id), { data: im.data });
}
