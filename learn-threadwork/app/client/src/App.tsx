// Given: the app shell. It puts your components together into the finished Threadwork.
// You don't need to change it, but reading it shows how every piece connects.
import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch } from "react";
import { createApi, type Api } from "@app/client/src/api/client";
import { AppProvider, useApp } from "@app/client/src/state/AppContext";
import type { AppState } from "@app/shared/types";
import type { AppAction } from "@app/client/src/state/rootReducer";
import { Backdrop, THEMES } from "@app/client/src/components/Art";
import { useLocalStorage } from "@app/client/src/hooks/useLocalStorage";
import { useHashRoute } from "@app/client/src/hooks/useHashRoute";
import { useServerSync, type SyncStatus } from "@app/client/src/hooks/useServerSync";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { LoginForm } from "@app/client/src/components/LoginForm";
import { Playground } from "@app/client/src/Playground";
import { ROUTES, ROUTE_NAMES } from "@app/client/src/views/shared";
import { TasksView } from "@app/client/src/views/TasksView";
import { DecisionsView } from "@app/client/src/views/DecisionsView";
import { SettingsView } from "@app/client/src/views/SettingsView";

const OFFLINE = "offline";

export function App() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => { const on = () => setHash(location.hash); window.addEventListener("hashchange", on); return () => window.removeEventListener("hashchange", on); }, []);
  if (hash === "#playground") return <Playground />;
  return <ErrorBoundary area="The app"><Main /></ErrorBoundary>;
}

function Main() {
  const [token, setToken] = useLocalStorage<string | null>("threadwork.token", null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const api = useMemo(() => (token && token !== OFFLINE ? createApi({ getToken: () => token }) : null), [token]);
  if (!token) {
    const anon = createApi();
    return (
      <main className="center">
        <h1 className="brand-big">Threadwork</h1>
        <p className="muted">Tasks, results and the decisions you make along the way.</p>
        <ErrorBoundary area="Sign-in">
          <LoginForm mode={mode} onSwitchMode={() => setMode(m => (m === "login" ? "register" : "login"))}
            onSubmit={async (email, pw) => setToken(mode === "login" ? await anon.login(email, pw) : await anon.register(email, pw))} />
        </ErrorBoundary>
        <p className="muted"><button className="link" onClick={() => setToken(OFFLINE)}>Use without the server</button> · <a href="#playground">Component playground</a></p>
      </main>
    );
  }
  return <Synced api={api} onSignOut={() => { setToken(null); location.hash = ""; }} />;
}

function Synced({ api, onSignOut }: { api: Api | null; onSignOut: () => void }) {
  const dispatchRef = useRef<Dispatch<AppAction> | null>(null);
  const replace = useCallback((state: AppState) => dispatchRef.current?.({ type: "replace", state }), []);
  const sync = useServerSync(api, replace);
  return (
    <AppProvider onChange={sync.onChange}>
      <Bridge onReady={(d, s) => { dispatchRef.current = d; sync.remember(s); }} />
      <Shell status={sync.status} onResolve={sync.resolve} onSignOut={onSignOut} />
    </AppProvider>
  );
}

function Bridge({ onReady }: { onReady: (d: Dispatch<AppAction>, s: AppState) => void }) {
  const { state, dispatch } = useApp();
  const once = useRef(false);
  useEffect(() => { if (!once.current) { once.current = true; onReady(dispatch, state); } });
  return null;
}

function syncText(status: SyncStatus): string {
  if (status.kind === "conflict") return "Changed on two devices";
  return { offline: "Saved on this device only", syncing: "Syncing…", synced: "Synced", error: `Sync problem: ${status.message ?? ""}` }[status.kind];
}

function Shell({ status, onResolve, onSignOut }: { status: SyncStatus; onResolve: (k: "this" | "other") => void; onSignOut: () => void }) {
  const [route, navigate] = useHashRoute(ROUTES, "tasks");
  const [editId, setEditId] = useState<string | null>(null);
  const [backdrop, setBackdrop] = useLocalStorage("threadwork.backdrop", "coffee");
  useEffect(() => { document.documentElement.dataset.backdrop = backdrop; }, [backdrop]);
  return (
    <div className="shell">
      <Backdrop id={backdrop} />
      <header className="top">
        <strong className="brand">Threadwork</strong>
        <nav aria-label="Main" className="tabs">
          {ROUTES.map(r => <a key={r} href={`#${r}`} aria-current={route === r ? "page" : undefined}>{ROUTE_NAMES[r]}</a>)}
        </nav>
        {status.kind === "conflict"
          ? <div className="banner" role="alert">Changed on another device too. Keep{" "}
              <button onClick={() => onResolve("this")}>this device's copy</button> or <button onClick={() => onResolve("other")}>the other copy</button>?</div>
          : <span className="sync">{syncText(status)}</span>}
        <label className="backdrop-pick"><span className="visually-hidden">Background</span>
          <select aria-label="Background" value={backdrop} onChange={e => setBackdrop(e.target.value)}>
            {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select></label>
      </header>
      <main className="view">
        <ErrorBoundary key={route} area={ROUTE_NAMES[route]}>
          {route === "tasks" && <TasksView editId={editId} onEdited={() => setEditId(null)} />}
          {route === "decisions" && <DecisionsView onEdit={id => { setEditId(id); navigate("tasks"); }} />}
          {route === "settings" && <SettingsView onSignOut={onSignOut} syncText={syncText(status)} backdrop={backdrop} onBackdrop={setBackdrop} />}
        </ErrorBoundary>
      </main>
    </div>
  );
}
