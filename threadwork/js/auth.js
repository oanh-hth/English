// Local sign-in for this device. The password is never stored: only a salted
// PBKDF2 hash. This locks the app on a shared device; it does not encrypt data.
import { getAccount, setAccount } from "./store.js";

const ITER = 210000;
const SESSION = "tw.session";
const DAYS = 30;
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
const unhex = s => new Uint8Array(s.match(/../g).map(h => parseInt(h, 16)));

async function hash(password, saltHex, iter = ITER) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: unhex(saltHex), iterations: iter }, key, 256);
  return hex(bits);
}

export const hasAccount = async () => !!(await getAccount());

export async function createAccount(name, email, password) {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  await setAccount({ name, email: email.toLowerCase(), salt, iter: ITER, hash: await hash(password, salt) });
  startSession(email);
}

export async function checkPassword(email, password) {
  const a = await getAccount();
  if (!a) return false;
  if (email && a.email !== email.toLowerCase()) return false;
  return (await hash(password, a.salt, a.iter)) === a.hash;
}

export async function changePassword(oldPw, newPw) {
  const a = await getAccount();
  if (!(await checkPassword(null, oldPw))) return false;
  a.salt = hex(crypto.getRandomValues(new Uint8Array(16))); a.iter = ITER; a.hash = await hash(newPw, a.salt);
  await setAccount(a); return true;
}

export function startSession(email) {
  try { localStorage.setItem(SESSION, JSON.stringify({ email: email.toLowerCase(), until: Date.now() + DAYS * 864e5 })); } catch {}
}
export function sessionValid() {
  try { const s = JSON.parse(localStorage.getItem(SESSION)); return !!s && s.until > Date.now(); } catch { return false; }
}
export function endSession() { try { localStorage.removeItem(SESSION); } catch {} }
export const account = getAccount;
