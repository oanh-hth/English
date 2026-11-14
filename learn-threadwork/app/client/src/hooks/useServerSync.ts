// Given: keeps the app state in step with the server, using your Phase 7 code.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Api } from "@app/client/src/api/client";
import type { AppState } from "@app/shared/types";
import { debounce, decideSync } from "@app/shared/sync";

const META = "threadwork.sync";
interface Meta { localSavedAt: number; lastSyncedAt: number }
const readMeta = (): Meta => { try { return { localSavedAt: 0, lastSyncedAt: 0, ...JSON.parse(localStorage.getItem(META) ?? "{}") }; } catch { return { localSavedAt: 0, lastSyncedAt: 0 }; } };
const writeMeta = (m: Meta) => { try { localStorage.setItem(META, JSON.stringify(m)); } catch { /* ignore */ } };

export type SyncStatus = { kind: "offline" | "syncing" | "synced" | "error"; message?: string } | { kind: "conflict"; remote: AppState; remoteSavedAt: number };

export function useServerSync(api: Api | null, replace: (s: AppState) => void) {
  const [status, setStatus] = useState<SyncStatus>({ kind: api ? "syncing" : "offline" });
  const latest = useRef<AppState | null>(null);

  const push = useCallback(async (state: AppState) => {
    if (!api) return;
    const meta = readMeta();
    setStatus({ kind: "syncing" });
    try {
      await api.putState(state, meta.localSavedAt, meta.lastSyncedAt);
      writeMeta({ ...meta, lastSyncedAt: meta.localSavedAt });
      setStatus({ kind: "synced" });
    } catch (e) {
      const err = e as { status?: number; message: string };
      if (err.status === 409) {
        const remote = await api.getState<AppState>();
        if (remote.state) { setStatus({ kind: "conflict", remote: remote.state, remoteSavedAt: remote.savedAt }); return; }
      }
      setStatus({ kind: "error", message: err.message });
    }
  }, [api]);

  const queued = useMemo(() => debounce((s: AppState) => { void push(s); }, 1200), [push]);

  // first load: compare with the server
  useEffect(() => {
    if (!api) return;
    let cancelled = false;
    api.getState<AppState>().then(remote => {
      if (cancelled) return;
      const meta = readMeta();
      const decision = decideSync({ localSavedAt: meta.localSavedAt, remoteSavedAt: remote.savedAt, lastSyncedAt: meta.lastSyncedAt });
      if (decision === "pull" && remote.state) { replace(remote.state); writeMeta({ localSavedAt: remote.savedAt, lastSyncedAt: remote.savedAt }); setStatus({ kind: "synced" }); }
      else if (decision === "push" && latest.current) void push(latest.current);
      else if (decision === "conflict" && remote.state) setStatus({ kind: "conflict", remote: remote.state, remoteSavedAt: remote.savedAt });
      else setStatus({ kind: "synced" });
    }).catch((e: Error) => !cancelled && setStatus({ kind: "error", message: e.message }));
    return () => { cancelled = true; queued.flush(); };
  }, [api, push, queued, replace]);

  const onChange = useCallback((state: AppState) => {
    latest.current = state;
    writeMeta({ ...readMeta(), localSavedAt: Date.now() });
    queued(state);
  }, [queued]);

  const resolve = useCallback((keep: "this" | "other") => {
    if (status.kind !== "conflict") return;
    if (keep === "other") { replace(status.remote); writeMeta({ localSavedAt: status.remoteSavedAt, lastSyncedAt: status.remoteSavedAt }); setStatus({ kind: "synced" }); }
    else { const meta = readMeta(); writeMeta({ localSavedAt: Date.now(), lastSyncedAt: status.remoteSavedAt }); if (latest.current) void push(latest.current); else setStatus({ kind: "synced" }); void meta; }
  }, [status, replace, push]);

  return { status, onChange, resolve, remember: (s: AppState) => { latest.current = s; } };
}
