// Given: try your components with sample data, without the server or the app state.
// Open http://localhost:5173/#playground
import { useState } from "react";
import type { Task } from "@app/shared/types";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { TaskItem } from "@app/client/src/components/TaskItem";
import { QuickCapture } from "@app/client/src/components/QuickCapture";
import { TaskList } from "@app/client/src/components/TaskList";
import { OutcomeForm } from "@app/client/src/components/OutcomeForm";
import { DecisionLog } from "@app/client/src/components/DecisionLog";
import { LoginForm } from "@app/client/src/components/LoginForm";
import { StickerPicker } from "@app/client/src/components/Stickers";
import { ThemePicker } from "@app/client/src/components/ThemePicker";

const base = (id: string, title: string, extra: Partial<Task> = {}): Task =>
  ({ id, title, complexity: "simple", status: "todo", due: null, createdAt: "2026-11-01", doneAt: null, outcome: null, ...extra });
const SAMPLE: Task[] = [
  base("a", "Reply to Minh about the workshop", { due: "2026-11-14" }),
  base("b", "Choose how to lay out the board", { complexity: "complex", due: "2026-11-16" }),
  base("c", "Pick a way to manage state", { complexity: "complex", status: "done", doneAt: "2026-11-12",
    outcome: { result: "Context + useReducer covers everything the app needs.", decision: "No state library for now.", category: "state" } }),
  base("d", "Update dependencies", { status: "done", doneAt: "2026-11-13" }),
];

export function Playground() {
  const [tasks, setTasks] = useState(SAMPLE);
  const [recording, setRecording] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [sticker, setSticker] = useState<string | null>("idea");
  const [theme, setTheme] = useState("coffee");
  const say = (s: string) => setLog(l => [s, ...l].slice(0, 6));
  const today = "2026-11-14";
  const t = tasks.find(x => x.id === recording);
  const edit = (id: string, fn: (t: Task) => Task) => setTasks(ts => ts.map(x => (x.id === id ? fn(x) : x)));
  const handlers = {
    onComplete: (id: string) => { say(`onComplete(${id})`); edit(id, x => ({ ...x, status: "done", doneAt: today })); },
    onRecord: (id: string) => { say(`onRecord(${id})`); setRecording(id); },
    onReopen: (id: string) => { say(`onReopen(${id})`); edit(id, x => ({ ...x, status: "todo", doneAt: null })); },
    onDelete: (id: string) => { say(`onDelete(${id})`); setTasks(ts => ts.filter(x => x.id !== id)); },
  };
  return (
    <div className="playground">
      <h1>Component playground</h1>
      <p className="muted">Sample data only. <a href="#">Back to the app</a></p>
      <ol className="log" aria-label="Events">{log.map((l, i) => <li key={i}>{l}</li>)}</ol>
      <h2>3.1 TaskItem</h2>
      <ErrorBoundary area="TaskItem"><ul className="plain">{tasks.map(x => <TaskItem key={x.id} task={x} today={today} {...handlers} />)}</ul></ErrorBoundary>
      <h2>3.2 QuickCapture</h2>
      <ErrorBoundary area="QuickCapture"><QuickCapture onAdd={(title, complexity, due) => { say(`onAdd("${title}", ${complexity}, ${due})`); setTasks(ts => [base(crypto.randomUUID(), title, { complexity, due }), ...ts]); }} /></ErrorBoundary>
      <h2>3.3 TaskList</h2>
      <ErrorBoundary area="TaskList"><TaskList tasks={tasks} today={today} {...handlers} /></ErrorBoundary>
      {t && <div className="overlay"><ErrorBoundary area="OutcomeForm"><OutcomeForm task={t} onCancel={() => setRecording(null)}
        onSave={o => { say(`onSave(${o.category})`); edit(t.id, x => ({ ...x, status: "done", doneAt: x.doneAt ?? today, outcome: o })); setRecording(null); }} /></ErrorBoundary></div>}
      <h2>5.3 DecisionLog</h2>
      <ErrorBoundary area="DecisionLog"><DecisionLog tasks={tasks} onEdit={id => { say(`onEdit(${id})`); setRecording(id); }} /></ErrorBoundary>
      <h2>8.4 StickerPicker</h2>
      <ErrorBoundary area="StickerPicker"><StickerPicker value={sticker} onChange={id => { say(`onChange(${id})`); setSticker(id); }} /></ErrorBoundary>
      <h2>8.1 ThemePicker</h2>
      <ErrorBoundary area="ThemePicker"><ThemePicker value={theme} onChange={id => { say(`onChange(${id})`); setTheme(id); }} /></ErrorBoundary>
      <h2>7.3 LoginForm</h2>
      <ErrorBoundary area="LoginForm"><LoginForm mode="register" onSwitchMode={() => say("onSwitchMode()")}
        onSubmit={email => new Promise((ok, no) => setTimeout(() => (email.startsWith("taken") ? no(new Error("An account with this email already exists")) : (say(`onSubmit(${email})`), ok())), 800))} /></ErrorBoundary>
    </div>
  );
}
