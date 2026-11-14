// Given: the Decisions page. Uses DecisionLog (5.3) and decisionsToMarkdown (5.4).
import { useApp } from "@app/client/src/state/AppContext";
import { DecisionLog } from "@app/client/src/components/DecisionLog";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { decisionsOf } from "@app/shared/decisions";
import { decisionsToMarkdown } from "@app/shared/export";
import { download, todayKey } from "@app/client/src/views/shared";

export function DecisionsView({ onEdit }: { onEdit: (taskId: string) => void }) {
  const { state } = useApp();
  return (
    <section className="card">
      <div className="row between">
        <h1>Decisions</h1>
        <ErrorBoundary area="Export">
          <button onClick={() => download(`decisions-${todayKey()}.md`, decisionsToMarkdown(decisionsOf(state.tasks)), "text/markdown")}>Export as Markdown</button>
        </ErrorBoundary>
      </div>
      <p className="muted">What you learned and decided while finishing complex tasks, filed by web development topic.</p>
      <ErrorBoundary area="The decision log"><DecisionLog tasks={state.tasks} onEdit={onEdit} /></ErrorBoundary>
    </section>
  );
}
