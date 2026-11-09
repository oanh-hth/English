// Exercise 5.6: Build and lay out the graph. Read curriculum/part-5/d-link-map.md first.
import type { AppState } from "@app/shared/types";

export type NodeKind = "task" | "note" | "sketch" | "resource";
export interface GraphNode { id: string; kind: NodeKind; label: string; x: number; y: number }
export type EdgeKind = "link" | "attached" | "used" | "planned";
export interface GraphEdge { from: string; to: string; kind: EdgeKind }
export interface Graph { nodes: GraphNode[]; edges: GraphEdge[] }

/**
 * Nodes: every task; every note and sketch that has a taskId; every resource attached to at least one task.
 * (x and y start at 0.) Labels: task title, note title or "Untitled note", sketch title, resource name.
 * Edges:
 * - "link" between linked tasks, ONCE per pair (from = the task that comes first in state.tasks)
 * - "attached" from a note/sketch to its task
 * - "used" / "planned" from a task to an attached resource (used true / false)
 * Ignore edges that point to ids that don't exist.
 */
export function graphFromState(state: AppState): Graph {
  // TODO 5.6
  return { nodes: [], edges: [] };
}

/**
 * Places nodes inside width × height, keeping `margin` from the edges. Deterministic (no Math.random):
 * 1. Start on a circle around the centre (node i at angle 2π·i/n, radius min(width, height)/3).
 * 2. Repeat `iterations` times: every pair pushes apart (force = 5000 / distance²), every edge pulls its two ends
 *    towards a rest length of 120 (force = (distance − 120) · 0.04), and every node is pulled slightly to the
 *    centre (0.004 · offset). Move each node by its total force, then clamp it inside the margins.
 * Returns NEW node objects; the input is not changed.
 */
export function layout(graph: Graph, width: number, height: number, iterations = 300, margin = 40): GraphNode[] {
  // TODO 5.6
  return graph.nodes;
}
