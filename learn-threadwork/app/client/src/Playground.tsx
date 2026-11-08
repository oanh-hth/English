// Given: try your components with sample data, without the server or the app state.
// Open http://localhost:5173/#playground
import { useState } from "react";
import type { Task } from "@app/shared/types";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { TaskCard } from "@app/client/src/components/TaskCard";
import { QuickCapture } from "@app/client/src/components/QuickCapture";
import { Board } from "@app/client/src/components/Board";
import { TaskDrawer } from "@app/client/src/components/TaskDrawer";
import { Plant } from "@app/client/src/components/Plant";
import { LoginForm } from "@app/client/src/components/LoginForm";
import { SketchPad } from "@app/client/src/components/SketchPad";

const base = (id: string, title: string, extra: Partial<Task> = {}): Task => ({ id, title, status: "inbox", importance: "medium", due: null,
  details: "", links: [], resources: [], createdAt: "2026-11-01", doneAt: null, ...extra });
const SAMPLE: Task[] = [
  base("a", "Draft project proposal", { status: "doing", importance: "high", due: "2026-11-10", links: ["b"] }),
  base("b", "Collect survey results", { importance: "critical", links: ["a"], resources: [{ resourceId: "r1", used: true }] }),
  base("c", "Sketch the onboarding flow"),
];

export function Playground() {
  const [tasks, setTasks] = useState(SAMPLE);
  const [open, setOpen] = useState<string | null>(null);
  const [growth, setGrowth] = useState(58);
  const [log, setLog] = useState<string[]>([]);
  const say = (s: string) => setLog(l => [s, ...l].slice(0, 6));
  const today = "2026-11-08";
  const t = tasks.find(x => x.id === open);
  const edit = (id: string, fn: (t: Task) => Task) => setTasks(ts => ts.map(x => (x.id === id ? fn(x) : x)));

  return (
    <div className="playground">
      <h1>Component playground</h1>
      <p className="muted">Sample data only. <a href="#">Back to the app</a></p>
      <ol className="log" aria-label="Events">{log.map((l, i) => <li key={i}>{l}</li>)}</ol>
      <h2>3.1 TaskCard</h2>
      <ErrorBoundary area="TaskCard"><div className="row">{tasks.map(x => <TaskCard key={x.id} task={x} today={today} onOpen={id => say(`onOpen(${id})`)} />)}</div></ErrorBoundary>
      <h2>3.2 QuickCapture</h2>
      <ErrorBoundary area="QuickCapture"><QuickCapture onAdd={title => { say(`onAdd("${title}")`); setTasks(ts => [base(crypto.randomUUID(), title), ...ts]); }} /></ErrorBoundary>
      <h2>3.3 Board</h2>
      <ErrorBoundary area="Board"><Board tasks={tasks} today={today} onOpen={setOpen} onMove={(id, s) => { say(`onMove(${id}, ${s})`); edit(id, x => ({ ...x, status: s })); }} /></ErrorBoundary>
      {t && <ErrorBoundary area="TaskDrawer"><TaskDrawer task={t} allTasks={tasks} onClose={() => setOpen(null)}
        onRename={(id, title) => { say(`onRename(${id}, "${title}")`); edit(id, x => ({ ...x, title })); }}
        onSetImportance={(id, importance) => { say(`onSetImportance(${id}, ${importance})`); edit(id, x => ({ ...x, importance })); }}
        onLink={(id, o) => { say(`onLink(${id}, ${o})`); setTasks(ts => ts.map(x => x.id === id ? { ...x, links: [...x.links, o] } : x.id === o ? { ...x, links: [...x.links, id] } : x)); }}
        onUnlink={(id, o) => { say(`onUnlink(${id}, ${o})`); setTasks(ts => ts.map(x => x.id === id ? { ...x, links: x.links.filter(l => l !== o) } : x.id === o ? { ...x, links: x.links.filter(l => l !== id) } : x)); }}
        onComplete={id => { say(`onComplete(${id})`); edit(id, x => ({ ...x, status: "done", doneAt: today })); }} /></ErrorBoundary>}
      <h2>5.1 Plant</h2>
      <label>Growth {growth}% <input type="range" min={0} max={100} value={growth} onChange={e => setGrowth(+e.target.value)} /></label>
      <ErrorBoundary area="Plant"><div className="plant-box"><Plant growth={growth} kind="tomato" /></div></ErrorBoundary>
      <h2>5.2 + 5.3 SketchPad</h2>
      <ErrorBoundary area="SketchPad"><SketchPad /></ErrorBoundary>
      <h2>7.3 LoginForm</h2>
      <ErrorBoundary area="LoginForm"><LoginForm mode="register" onSwitchMode={() => say("onSwitchMode()")}
        onSubmit={(email) => new Promise((ok, no) => setTimeout(() => (email.startsWith("taken") ? no(new Error("An account with this email already exists")) : (say(`onSubmit(${email})`), ok())), 800))} /></ErrorBoundary>
    </div>
  );
}
