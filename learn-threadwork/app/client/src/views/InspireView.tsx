// Given: the Inspiration page. Uses InspirationWall (7.6), the pins reducer (7.5) and useCountdown (4.2).
import { useApp } from "@app/client/src/state/AppContext";
import { InspirationWall } from "@app/client/src/components/InspirationWall";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { useCountdown } from "@app/client/src/hooks/useCountdown";
import { FOCUS_GROWTH } from "@app/shared/growth";
import { newId } from "@app/client/src/views/shared";

function Focus() {
  const { dispatch } = useApp();
  const t = useCountdown(25 * 60, () => dispatch({ type: "focusDone" }));
  const mm = String(Math.floor(t.remaining / 60)).padStart(2, "0"), ss = String(t.remaining % 60).padStart(2, "0");
  return (
    <section className="card" aria-label="Focus timer">
      <h2>Focus session</h2>
      <p className="timer">{mm}:{ss}</p>
      <button className="primary" onClick={t.running ? t.pause : t.start}>{t.running ? "Pause" : "Start 25 min"}</button> <button onClick={t.reset}>Reset</button>
      <p className="muted">A finished session waters your plant (+{FOCUS_GROWTH}%).</p>
    </section>
  );
}

export function InspireView() {
  const { state, dispatch } = useApp();
  const wins = state.tasks.filter(t => t.status === "done").sort((a, b) => (b.doneAt ?? "").localeCompare(a.doneAt ?? ""));
  return (
    <div className="grid-2">
      <section className="card">
        <h1>Inspiration</h1>
        <ErrorBoundary area="The inspiration wall">
          <InspirationWall pins={state.pins} wins={wins}
            onAddQuote={(text, author) => dispatch({ type: "addQuote", id: newId(), text, author })}
            onAddGoal={text => dispatch({ type: "addGoal", id: newId(), text })}
            onRemove={id => dispatch({ type: "removePin", id })}
            onMove={(id, by) => dispatch({ type: "movePin", id, by })} />
        </ErrorBoundary>
      </section>
      <ErrorBoundary area="Focus timer"><Focus /></ErrorBoundary>
    </div>
  );
}
