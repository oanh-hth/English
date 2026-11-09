import type { AppState } from "@app/shared/types";

export type NodeKind = "task" | "note" | "sketch" | "resource";
export interface GraphNode { id: string; kind: NodeKind; label: string; x: number; y: number }
export type EdgeKind = "link" | "attached" | "used" | "planned";
export interface GraphEdge { from: string; to: string; kind: EdgeKind }
export interface Graph { nodes: GraphNode[]; edges: GraphEdge[] }

export function graphFromState(state: AppState): Graph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const add = (id: string, kind: NodeKind, label: string) => nodes.push({ id, kind, label, x: 0, y: 0 });
  const taskIds = new Set(state.tasks.map(t => t.id));
  const order = new Map(state.tasks.map((t, i) => [t.id, i]));
  state.tasks.forEach(t => add(t.id, "task", t.title));
  for (const n of state.notes) if (n.taskId && taskIds.has(n.taskId)) { add(n.id, "note", n.title || "Untitled note"); edges.push({ from: n.id, to: n.taskId, kind: "attached" }); }
  for (const s of state.sketches) if (s.taskId && taskIds.has(s.taskId)) { add(s.id, "sketch", s.title); edges.push({ from: s.id, to: s.taskId, kind: "attached" }); }
  const used = new Set<string>();
  for (const t of state.tasks) {
    for (const l of t.links) if (taskIds.has(l) && order.get(t.id)! < order.get(l)!) edges.push({ from: t.id, to: l, kind: "link" });
    for (const r of t.resources) if (state.resources.some(x => x.id === r.resourceId)) { used.add(r.resourceId); edges.push({ from: t.id, to: r.resourceId, kind: r.used ? "used" : "planned" }); }
  }
  for (const r of state.resources) if (used.has(r.id)) add(r.id, "resource", r.name);
  return { nodes, edges };
}

export function layout(graph: Graph, width: number, height: number, iterations = 300, margin = 40): GraphNode[] {
  const n = graph.nodes.length, cx = width / 2, cy = height / 2, radius = Math.min(width, height) / 3;
  const pos = graph.nodes.map((node, i) => ({ ...node, x: cx + Math.cos((2 * Math.PI * i) / n) * radius, y: cy + Math.sin((2 * Math.PI * i) / n) * radius }));
  const index = new Map(pos.map((p, i) => [p.id, i]));
  const edges = graph.edges.map(e => [index.get(e.from), index.get(e.to)] as const).filter((e): e is readonly [number, number] => e[0] !== undefined && e[1] !== undefined);
  for (let it = 0; it < iterations; it++) {
    const fx = new Array(n).fill(0), fy = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const dx = pos[i]!.x - pos[j]!.x, dy = pos[i]!.y - pos[j]!.y, d = Math.hypot(dx, dy) || 1, f = 5000 / (d * d);
      fx[i] += (dx / d) * f; fy[i] += (dy / d) * f; fx[j] -= (dx / d) * f; fy[j] -= (dy / d) * f;
    }
    for (const [a, b] of edges) {
      const dx = pos[b]!.x - pos[a]!.x, dy = pos[b]!.y - pos[a]!.y, d = Math.hypot(dx, dy) || 1, f = (d - 120) * 0.04;
      fx[a] += (dx / d) * f; fy[a] += (dy / d) * f; fx[b] -= (dx / d) * f; fy[b] -= (dy / d) * f;
    }
    for (let i = 0; i < n; i++) {
      const p = pos[i]!;
      p.x = Math.min(width - margin, Math.max(margin, p.x + fx[i] + (cx - p.x) * 0.004));
      p.y = Math.min(height - margin, Math.max(margin, p.y + fy[i] + (cy - p.y) * 0.004));
    }
  }
  return pos;
}
