// Exercise 7.2: deciding what to sync. See curriculum/phase-7-full-stack/7.2-sync.md

export interface SyncInfo {
  localSavedAt: number;     // when this device last changed something
  remoteSavedAt: number;    // savedAt of the copy on the server (0 = nothing there)
  lastSyncedAt: number;     // savedAt of the copy both sides agreed on last time (0 = never synced)
}

export type SyncDecision = "none" | "push" | "pull" | "conflict";

/**
 * - Both sides equal: "none".
 * - Only this device changed since the last sync: "push".
 * - Only the server changed: "pull".
 * - Both changed since the last sync: "conflict" (the app asks which copy to keep).
 * "Changed" means savedAt > lastSyncedAt. If neither changed but they differ, newer wins (push or pull).
 */
export function decideSync(info: SyncInfo): SyncDecision {
  // TODO 7.2
  throw new Error("TODO 7.2");
}

/**
 * Calls `fn` at most once per `waitMs`: each call restarts the wait, and only the last arguments are used.
 * Returns the wrapped function plus flush() (run now if something is waiting) and cancel().
 * Used to send changes to the server a moment after you stop typing.
 */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, waitMs: number) {
  // TODO 7.2
  const call = (..._args: A) => { throw new Error("TODO 7.2"); };
  return Object.assign(call, { flush: () => {}, cancel: () => {} });
}
