import type { KeyboardEvent } from "react";
import type { GraphEdge, GraphNode } from "@app/client/src/map/graph";

export interface LinkMapProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  onOpen: (node: GraphNode) => void;
}

const short = (s: string) => (s.length > 22 ? s.slice(0, 21) + "…" : s);

function Shape({ kind }: { kind: GraphNode["kind"] }) {
  if (kind === "task") return <circle r={12} className="node-task" />;
  if (kind === "resource") return <path d="M0 -11 L11 0 L0 11 L-11 0 Z" className="node-resource" />;
  return <rect x={-8} y={-8} width={16} height={16} rx={3} className={`node-${kind}`} />;
}

export function LinkMap({ nodes, edges, width, height, onOpen }: LinkMapProps) {
  if (nodes.length === 0) return <p>Add tasks and link them to see your map.</p>;
  const at = new Map(nodes.map(n => [n.id, n]));
  const drawn = edges.filter(e => at.has(e.from) && at.has(e.to));
  const tasks = nodes.filter(n => n.kind === "task").length;
  const key = (n: GraphNode) => (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(n); } };
  return (
    <svg role="img" aria-label={`Map of ${tasks} tasks and ${drawn.length} connections`} viewBox={`0 0 ${width} ${height}`} className="link-map">
      {drawn.map((e, i) => {
        const a = at.get(e.from)!, b = at.get(e.to)!;
        return <line key={i} data-kind={e.kind} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`edge-${e.kind}`} />;
      })}
      {nodes.map(n => (
        <g key={n.id} role="button" tabIndex={0} aria-label={`${n.kind}: ${n.label}`} data-kind={n.kind}
          transform={`translate(${n.x} ${n.y})`} onClick={() => onOpen(n)} onKeyDown={key(n)} className="node">
          <Shape kind={n.kind} />
          <text y={n.kind === "task" ? 28 : 24} textAnchor="middle">{short(n.label)}</text>
        </g>
      ))}
    </svg>
  );
}
