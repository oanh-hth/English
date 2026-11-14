// Saves the app state on this device (IndexedDB, through db.js).
import * as db from "./db.js";

export const loadState = () => db.get("state");
export async function saveState(S) { await db.set("state", JSON.parse(JSON.stringify(S))); return { changed: [], removed: [] }; }
export const stripImages = S => JSON.parse(JSON.stringify(S));
export const attachImages = async S => S;
export const getAccount = () => db.get("account");
export const setAccount = a => db.set("account", a);
export const wipeAll = () => db.clear();
