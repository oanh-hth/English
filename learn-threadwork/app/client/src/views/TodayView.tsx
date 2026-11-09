// Given: the Today page. Uses todayModel (4.6), TaskCard (3.1), Plant (7.1), Sky and quoteOfTheDay (7.5).
import { useApp } from "@app/client/src/state/AppContext";
import { todayModel } from "@app/client/src/state/today";
import { TaskCard } from "@app/client/src/components/TaskCard";
import { Plant } from "@app/client/src/components/Plant";
import { Sky } from "@app/client/src/components/Sky";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { quoteOfTheDay } from "@app/shared/pins";
import { nextStage, stageOf } from "@app/shared/growth";
import { VARIETIES } from "@app/shared/garden";
import { todayKey } from "@app/client/src/format";
import { useShell } from "@app/client/src/views/shared";

export function TodayView() {
  const { state, dispatch } = useApp();
  const { go, weather } = useShell();
  const today = todayKey();
  const m = todayModel(state, today, new Date().getHours());
  const g = state.garden, next = nextStage(g.growth);
  const quote = quoteOfTheDay(state.pins, new Date().getDate());
  const list = (tasks: typeof m.due) => tasks.map(t => (
    <div key={t.id} className="today-line">
      <button className="check" aria-label={`Finish ${t.title}`} onClick={() => dispatch({ type: "move", id: t.id, status: "done", today })}>✓</button>
      <TaskCard task={t} today={today} onOpen={id => go("tasks", { taskId: id })} />
    </div>
  ));
  return (
    <div className="today">
      <section className="card">
        <h1>{m.greeting}</h1>
        <p><b>{m.doneToday} of {m.goal}</b> done today · {state.streak.streak}-day streak</p>
        <progress value={m.progress} max={1} aria-label="Today's progress" />
      </section>
      <div className="grid-2">
        <section className="card" aria-label="Due soon"><h2>Due today and tomorrow</h2>
          {m.due.length ? list(m.due) : <p className="muted">Nothing due soon. Capture a task in the bar above.</p>}</section>
        <section className="card garden-mini">
          <ErrorBoundary area="Your plant">
            <Sky weather={weather?.kind ?? null} isDay={weather?.isDay ?? null} small><Plant growth={g.growth} kind={g.kind} /></Sky>
          </ErrorBoundary>
          <p><b>{VARIETIES[g.kind].name} · {stageOf(g.growth)}</b></p>
          <p className="muted">{next ? `${Math.round(next.missing)}% to ${next.name.toLowerCase()}` : "Ready to harvest!"}</p>
          <button onClick={() => go("garden")}>Open the garden</button>
        </section>
      </div>
      <div className="grid-2">
        <section className="card" aria-label="Inbox"><h2>Captured, not planned yet</h2>
          {m.inbox.length ? list(m.inbox) : <p className="muted">Inbox is clear.</p>}</section>
        {quote && <blockquote className="card quote">“{quote.text}”{quote.author && <cite>{quote.author}</cite>}</blockquote>}
      </div>
    </div>
  );
}
