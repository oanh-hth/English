// Given: the app shell. It puts your components together into the finished Threadwork.
// You don't need to change it, but reading it shows how every piece connects.
import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch } from "react";
import { createApi, type Api } from "@app/client/src/api/client";
import { AppProvider, useApp } from "@app/client/src/state/AppContext";
import type { AppAction, AppState } from "@app/client/src/state/appReducer";
import { useLocalStorage } from "@app/client/src/hooks/useLocalStorage";
import { useHashRoute } from "@app/client/src/hooks/useHashRoute";
import { useServerSync, type SyncStatus } from "@app/client/src/hooks/useServerSync";
import { useWeather, type Place } from "@app/client/src/hooks/useWeather";
import { useBadgeToasts } from "@app/client/src/hooks/useBadgeToasts";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { LoginForm } from "@app/client/src/components/LoginForm";
import { QuickCapture } from "@app/client/src/components/QuickCapture";
import { Playground } from "@app/client/src/Playground";
import { computeStats } from "@app/shared/badges";
import { todayKey } from "@app/client/src/format";
import { ROUTES, ROUTE_NAMES, ShellContext, newId, type Route, type ShellValue } from "@app/client/src/views/shared";
import { TodayView } from "@app/client/src/views/TodayView";
import { TasksView } from "@app/client/src/views/TasksView";
import { MapView } from "@app/client/src/views/MapView";
import { SketchView } from "@app/client/src/views/SketchView";
import { NotesView } from "@app/client/src/views/NotesView";
import { ResourcesView } from "@app/client/src/views/ResourcesView";
import { InspireView } from "@app/client/src/views/InspireView";
import { GardenView } from "@app/client/src/views/GardenView";
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
      <Shell api={api} status={sync.status} onResolve={sync.resolve} onSignOut={onSignOut} />
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

function Toasts() {
  const { state } = useApp();
  const stats = useMemo(() => { try { return computeStats(state.tasks, state.garden, state.streak, state.focusSessions); } catch { return null; } }, [state]);
  const { toasts, dismiss } = useBadgeToasts(stats ?? { finished: 0, finishedCritical: 0, linkPairs: 0, resourcesUsed: 0, harvests: 0, streak: 0, focusSessions: 0 });
  return (
    <div className="toasts" role="status">
      {toasts.map(t => <button key={t.id} className="toast" onClick={() => dismiss(t.id)}><b>New badge: {t.name}</b><span>{t.description}</span></button>)}
    </div>
  );
}

function Shell({ api, status, onResolve, onSignOut }: { api: Api | null; status: SyncStatus; onResolve: (k: "this" | "other") => void; onSignOut: () => void }) {
  const { dispatch } = useApp();
  const [route, navigate] = useHashRoute(ROUTES, "today");
  const [selected, setSelected] = useState<ShellValue["selected"]>({});
  const [place] = useLocalStorage<Place | null>("threadwork.place", null);
  const { weather } = useWeather(api, place);
  const shell: ShellValue = {
    go: (r: Route, select = {}) => { setSelected(select); navigate(r); },
    selected, api, weather,
  };
  const View = { today: TodayView, tasks: TasksView, map: MapView, sketch: SketchView, notes: NotesView, resources: ResourcesView,
    inspire: InspireView, garden: GardenView, settings: () => <SettingsView onSignOut={onSignOut} syncText={syncText(status)} /> }[route];

  return (
    <ShellContext.Provider value={shell}>
      <div className="shell">
        <nav className="rail" aria-label="Main">
          <strong className="brand">Threadwork</strong>
          {ROUTES.map(r => <a key={r} href={`#${r}`} aria-current={route === r ? "page" : undefined} onClick={() => setSelected({})}>{ROUTE_NAMES[r]}</a>)}
        </nav>
        <div className="main">
          <header className="top">
            <ErrorBoundary area="Quick capture">
              <QuickCapture onAdd={title => dispatch({ type: "addTask", id: newId(), title, today: todayKey() })} />
            </ErrorBoundary>
            {status.kind === "conflict"
              ? <div className="banner" role="alert">Your data changed on another device too. Keep{" "}
                  <button onClick={() => onResolve("this")}>this device's copy</button> or <button onClick={() => onResolve("other")}>the other copy</button>?</div>
              : <span className="sync">{syncText(status)}</span>}
          </header>
          <main className="view">
            <ErrorBoundary key={route} area={ROUTE_NAMES[route]}><View /></ErrorBoundary>
          </main>
        </div>
        <ErrorBoundary area="Badges"><Toasts /></ErrorBoundary>
      </div>
    </ShellContext.Provider>
  );
}
