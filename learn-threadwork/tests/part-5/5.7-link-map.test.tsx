// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LinkMap } from "@app/client/src/components/LinkMap";
import type { GraphEdge, GraphNode } from "@app/client/src/map/graph";

const nodes: GraphNode[] = [
  { id: "a", kind: "task", label: "Proposal", x: 100, y: 100 }, { id: "b", kind: "task", label: "Survey", x: 300, y: 120 },
  { id: "n1", kind: "note", label: "Intro", x: 120, y: 220 }, { id: "r1", kind: "resource", label: "Budget", x: 260, y: 240 },
];
const edges: GraphEdge[] = [{ from: "a", to: "b", kind: "link" }, { from: "n1", to: "a", kind: "attached" }, { from: "a", to: "r1", kind: "used" }, { from: "a", to: "zzz", kind: "planned" }];

describe("LinkMap", () => {
  it("describes the map", () => {
    render(<LinkMap nodes={nodes} edges={edges} width={400} height={300} onOpen={() => {}} />);
    expect(screen.getByRole("img", { name: "Map of 2 tasks and 3 connections" })).toBeInTheDocument();
  });
  it("draws edges between existing nodes", () => {
    render(<LinkMap nodes={nodes} edges={edges} width={400} height={300} onOpen={() => {}} />);
    const lines = document.querySelectorAll("line");
    expect([...lines].map(l => l.getAttribute("data-kind"))).toEqual(["link", "attached", "used"]);
    expect(lines[0]).toHaveAttribute("x1", "100");
    expect(lines[0]).toHaveAttribute("x2", "300");
  });
  it("opens nodes by click and keyboard", async () => {
    const onOpen = vi.fn();
    render(<LinkMap nodes={nodes} edges={edges} width={400} height={300} onOpen={onOpen} />);
    await userEvent.click(screen.getByRole("button", { name: "note: Intro" }));
    screen.getByRole("button", { name: "resource: Budget" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onOpen.mock.calls.map(c => c[0].id)).toEqual(["n1", "r1"]);
  });
  it("explains an empty map", () => {
    render(<LinkMap nodes={[]} edges={[]} width={400} height={300} onOpen={() => {}} />);
    expect(screen.getByText("Add tasks and link them to see your map.")).toBeInTheDocument();
  });
});
