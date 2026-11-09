// Given: the Resources page. Uses resourceUsage (5.3) and ResourceLibrary (5.5).
import { useApp } from "@app/client/src/state/AppContext";
import { ResourceLibrary } from "@app/client/src/components/ResourceLibrary";
import { resourceUsage } from "@app/shared/resources";
import { newId, useShell } from "@app/client/src/views/shared";

export function ResourcesView() {
  const { state, dispatch } = useApp();
  const { go } = useShell();
  return (
    <section className="card">
      <h1>Resources</h1>
      <p className="muted">Everything you use to get work done. Attach them to tasks and tick the ones you actually used.</p>
      <ResourceLibrary resources={state.resources} tasks={state.tasks} usage={resourceUsage(state)}
        onAdd={(name, kind, url) => dispatch({ type: "addResource", id: newId(), name, kind, url })}
        onRemove={id => dispatch({ type: "removeResource", id })}
        onOpenTask={id => go("tasks", { taskId: id })} />
    </section>
  );
}
