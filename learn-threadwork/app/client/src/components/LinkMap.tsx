// Exercise 5.7: LinkMap. Read curriculum/part-5/d-link-map.md first.
import type { GraphEdge, GraphNode } from "@app/client/src/map/graph";
import { Todo } from "@app/client/src/components/Todo";

export interface LinkMapProps {
  nodes: GraphNode[];          // already laid out
  edges: GraphEdge[];
  width: number;
  height: number;
  onOpen: (node: GraphNode) => void;
}

/**
 * <svg role="img" aria-label="Map of N tasks and M connections" viewBox="0 0 width height"> (N = task nodes, M = edges):
 * - one <line data-kind={edge.kind}> per edge between its two nodes (skip edges with missing nodes)
 * - one <g role="button" tabIndex={0} aria-label="<kind>: <label>" data-kind={kind}> per node, positioned at x/y,
 *   with a shape and a <text> label. Click, Enter or Space calls onOpen(node).
 * With no nodes, render <p>Add tasks and link them to see your map.</p> instead.
 */
export function LinkMap(props: LinkMapProps) {
  // TODO 5.7
  return <Todo exercise="5.7" what="The link map" />;
}
