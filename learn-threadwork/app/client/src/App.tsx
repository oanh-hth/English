// Given: the app shell. It puts your components together. You don't need to change this file,
// but reading it is a good way to see how the pieces connect.
import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch } from "react";
import { createApi, type Api, type WeatherReply } from "@app/client/src/api/client";
import { AppProvider, useApp } from "@app/client/src/state/AppContext";
import type { AppAction, AppState } from "@app/client/src/state/appReducer";
import { useLocalStorage } from "@app/client/src/hooks/useLocalStorage";
import { useCountdown } from "@app/client/src/hooks/useCountdown";
import { useServerSync, type SyncStatus } from "@app/client/src/hooks/useServerSync";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { LoginForm } from "@app/client/src/components/LoginForm";
import { QuickCapture } from "@app/client/src/components/QuickCapture";
import { Board } from "@app/client/src/components/Board";
import { TaskDrawer } from "@app/client/src/components/TaskDrawer";
import { Plant } from "@app/client/src/components/Plant";
import { SketchPad } from "@app/client/src/components/SketchPad";
import { Playground } from "@app/client/src/Playground";
import { todayKey } from "@app/client/src/format";
import { stageOf, nextStage } from "@app/shared/growth";
import { VARIETIES } from "@app/shared/garden";

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
        <ErrorBoundary area="Sign-in">
          <LoginForm mode={mode} onSwitchMode={() => setMode(m => (m === "login" ? "register" : "login"))}
            onSubmit={async (email, pw) => setToken(mode === "login" ? await anon.login(email, pw) : await anon.register(email, pw))} />
        </ErrorBoundary>
        <p className="muted">
          <button className="link" onClick={() => setToken(OFFLINE)}>Use without the server</button> ·{" "}
          <a href="#playground">Component playground</a>
        </p>
      </main>
    );
  }
  return <Synced api={api} onSignOut={() => setToken(null)} />;
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

function SyncLine({ status, onResolve }: { status: SyncStatus; onResolve: (k: "this" | "other") => void }) {
  if (status.kind === "conflict")
    return <div className="banner" role="alert">Your data changed on another device too. Which copy do you want to keep?{" "}
      <button onClick={() => onResolve("this")}>This device</button> <button onClick={() => onResolve("other")}>The other device</button></div>;
  const text = { offline: "Saved on this device only", syncing: "Syncing…", synced: "Synced", error: `Sync problem: ${status.message ?? ""}` }[status.kind];
  return <span className="sync">{text}</span>;
}

function Shell({ api, status, onResolve, onSignOut }: { api: Api | null; status: SyncStatus; onResolve: (k: "this" | "other") => void; onSignOut: () => void }) {
  const { state, dispatch } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<"board" | "sketch">("board");
  const today = todayKey();
  const open = state.tasks.find(t => t.id === openId) ?? null;

  return (
    <div className="shell">
      <header className="top">
        <strong className="brand">Threadwork</strong>
        <ErrorBoundary area="Quick capture">
          <QuickCapture onAdd={title => dispatch({ type: "addTask", id: crypto.randomUUID(), title, today })} />
        </ErrorBoundary>
        <SyncLine status={status} onResolve={onResolve} />
        <button className="link" onClick={onSignOut}>Sign out</button>
      </header>
      <div className="layout">
        <main>
          <nav className="tabs">
            <button aria-pressed={tab === "board"} onClick={() => setTab("board")}>Tasks</button>
            <button aria-pressed={tab === "sketch"} onClick={() => setTab("sketch")}>Sketch</button>
            <a href="#playground">Playground</a>
          </nav>
          {tab === "board"
            ? <ErrorBoundary area="The board"><Board tasks={state.tasks} today={today} onOpen={setOpenId} onMove={(id, s) => dispatch({ type: "move", id, status: s, today })} /></ErrorBoundary>
            : <ErrorBoundary area="Sketching"><SketchPad /></ErrorBoundary>}
        </main>
        <aside className="side">
          <ErrorBoundary area="The garden"><Garden /></ErrorBoundary>
          <ErrorBoundary area="Focus timer"><Focus onDone={() => dispatch({ type: "focusDone" })} /></ErrorBoundary>
          <ErrorBoundary area="Weather"><WeatherCard api={api} /></ErrorBoundary>
        </aside>
      </div>
      {open && (
        <ErrorBoundary area="Task details">
          <TaskDrawer task={open} allTasks={state.tasks} onClose={() => setOpenId(null)}
            onRename={(id, title) => dispatch({ type: "rename", id, title })}
            onSetImportance={(id, importance) => dispatch({ type: "setImportance", id, importance })}
            onLink={(id, other) => dispatch({ type: "link", a: id, b: other })}
            onUnlink={(id, other) => dispatch({ type: "unlink", a: id, b: other })}
            onComplete={id => dispatch({ type: "move", id, status: "done", today })} />
        </ErrorBoundary>
      )}
    </div>
  );
}

function Garden() {
  const { state, dispatch } = useApp();
  const g = state.garden;
  const next = nextStage(g.growth);
  return (
    <section className="card garden" aria-label="Garden">
      <h2>{VARIETIES[g.kind].name} · {stageOf(g.growth)}</h2>
      <Plant growth={g.growth} kind={g.kind} />
      <p>{Math.round(g.growth)}% grown{next ? ` · ${Math.round(next.missing)}% to ${next.name.toLowerCase()}` : ""}</p>
      {g.growth >= 100 && <button className="primary" onClick={() => dispatch({ type: "harvest", day: todayKey() })}>Harvest {VARIETIES[g.kind].fruits} {VARIETIES[g.kind].plural}</button>}
      <p className="muted">{state.streak.streak}-day streak · {g.harvests.length} harvests</p>
    </section>
  );
}

function Focus({ onDone }: { onDone: () => void }) {
  const t = useCountdown(25 * 60, onDone);
  const mm = String(Math.floor(t.remaining / 60)).padStart(2, "0"), ss = String(t.remaining % 60).padStart(2, "0");
  return (
    <section className="card" aria-label="Focus timer">
      <h2>Focus</h2>
      <p className="timer">{mm}:{ss}</p>
      <button onClick={t.running ? t.pause : t.start}>{t.running ? "Pause" : "Start 25 min"}</button> <button onClick={t.reset}>Reset</button>
    </section>
  );
}

function WeatherCard({ api }: { api: Api | null }) {
  const [w, setW] = useState<WeatherReply | null>(null);
  const [msg, setMsg] = useState("");
  if (!api) return null;
  const load = () => {
    setMsg("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      p => api.weather(+p.coords.latitude.toFixed(2), +p.coords.longitude.toFixed(2)).then(r => { setW(r); setMsg(""); }).catch((e: Error) => setMsg(e.message)),
      () => setMsg("Location permission was declined."));
  };
  return (
    <section className="card" aria-label="Weather">
      <h2>Weather</h2>
      {w ? <p>{w.kind}, {w.temp}°, wind {w.wind} km/h, {w.isDay ? "day" : "night"}</p> : <button onClick={load}>Show weather here</button>}
      {msg && <p className="muted">{msg}</p>}
    </section>
  );
}
