import { graphFromState, layout } from "@app/client/src/map/graph";
import { appState, task, deepFreeze } from "../helpers";

const state = appState({
  tasks: [task("a", { title: "Proposal", links: ["b"], resources: [{ resourceId: "r1", used: true }] }), task("b", { title: "Survey", links: ["a", "ghost"] }), task("c", { title: "Alone", resources: [{ resourceId: "r2", used: false }] })],
  notes: [{ id: "n1", kind: "note", title: "", body: "", rows: [], taskId: "a", updatedAt: 0 }, { id: "n2", kind: "note", title: "Loose", body: "", rows: [], taskId: null, updatedAt: 0 }],
  sketches: [{ id: "s1", title: "Flow", taskId: "b", strokes: [], width: 1, height: 1, createdAt: "2026-11-01" }],
  resources: [{ id: "r1", name: "Budget", kind: "file", url: "" }, { id: "r2", name: "Minh", kind: "person", url: "" }, { id: "r3", name: "Unused", kind: "book", url: "" }],
});

describe("graphFromState", () => {
  it("builds the nodes", () => {
    const g = graphFromState(state);
    expect(g.nodes.map(n => `${n.kind}:${n.id}:${n.label}`).sort()).toEqual(
      ["note:n1:Untitled note", "resource:r1:Budget", "resource:r2:Minh", "sketch:s1:Flow", "task:a:Proposal", "task:b:Survey", "task:c:Alone"].sort());
  });
  it("builds each edge once", () => {
    const g = graphFromState(state);
    expect(g.edges.map(e => `${e.from}-${e.to}:${e.kind}`).sort()).toEqual(["a-b:link", "a-r1:used", "c-r2:planned", "n1-a:attached", "s1-b:attached"].sort());
  });
});

describe("layout", () => {
  const g = deepFreeze(graphFromState(state));
  it("keeps every node inside the margins", () => {
    for (const n of layout(g, 600, 400)) {
      expect(n.x).toBeGreaterThanOrEqual(40); expect(n.x).toBeLessThanOrEqual(560);
      expect(n.y).toBeGreaterThanOrEqual(40); expect(n.y).toBeLessThanOrEqual(360);
    }
  });
  it("is deterministic and does not mutate", () => {
    expect(layout(g, 600, 400)).toEqual(layout(g, 600, 400));
    expect(g.nodes[0]).toMatchObject({ x: 0, y: 0 });
  });
  it("keeps connected nodes closer than unconnected ones", () => {
    const pos = new Map(layout(g, 900, 700).map(n => [n.id, n]));
    const d = (a: string, b: string) => Math.hypot(pos.get(a)!.x - pos.get(b)!.x, pos.get(a)!.y - pos.get(b)!.y);
    expect(d("n1", "a")).toBeLessThan(d("n1", "c"));
    expect(d("s1", "b")).toBeLessThan(d("s1", "c"));
  });
  it("starts on a circle when there are no iterations", () => {
    const pos = layout(g, 600, 600, 0);
    expect(pos[0]).toMatchObject({ x: 500, y: 300 });
  });
});
