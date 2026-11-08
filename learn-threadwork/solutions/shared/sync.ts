export interface SyncInfo { localSavedAt: number; remoteSavedAt: number; lastSyncedAt: number }
export type SyncDecision = "none" | "push" | "pull" | "conflict";

export function decideSync({ localSavedAt, remoteSavedAt, lastSyncedAt }: SyncInfo): SyncDecision {
  if (localSavedAt === remoteSavedAt) return "none";
  const localChanged = localSavedAt > lastSyncedAt, remoteChanged = remoteSavedAt > lastSyncedAt;
  if (localChanged && remoteChanged) return "conflict";
  if (localChanged) return "push";
  if (remoteChanged) return "pull";
  return localSavedAt > remoteSavedAt ? "push" : "pull";
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, waitMs: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let last: A | null = null;
  const run = () => { timer = null; const args = last; last = null; if (args) fn(...args); };
  const call = (...args: A) => { last = args; if (timer) clearTimeout(timer); timer = setTimeout(run, waitMs); };
  return Object.assign(call, {
    flush: () => { if (timer) { clearTimeout(timer); run(); } },
    cancel: () => { if (timer) clearTimeout(timer); timer = null; last = null; },
  });
}
