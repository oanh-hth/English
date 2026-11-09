// Given: the Link map page. Uses graphFromState and layout (5.6) and LinkMap (5.7).
import { useMemo } from "react";
import { useApp } from "@app/client/src/state/AppContext";
import { graphFromState, layout } from "@app/client/src/map/graph";
import { LinkMap } from "@app/client/src/components/LinkMap";
import { useShell } from "@app/client/src/views/shared";

const W = 900, H = 560;

export function MapView() {
  const { state } = useApp();
  const { go } = useShell();
  const graph = useMemo(() => graphFromState(state), [state]);
  const nodes = useMemo(() => layout(graph, W, H), [graph]);
  return (
    <section className="card">
      <h1>Link map</h1>
      <p className="muted">Every task, the notes and sketches attached to it, and the resources it uses. Tap anything to open it.</p>
      <LinkMap nodes={nodes} edges={graph.edges} width={W} height={H} onOpen={n =>
        n.kind === "task" ? go("tasks", { taskId: n.id }) : n.kind === "note" ? go("notes", { noteId: n.id }) : n.kind === "sketch" ? go("sketch", { sketchId: n.id }) : go("resources")} />
      <p className="legend"><span className="lg-task">● task</span> <span className="lg-note">■ note</span> <span className="lg-sketch">■ sketch</span> <span className="lg-resource">◆ resource</span></p>
    </section>
  );
}
