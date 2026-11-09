// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { strokeToSaved } from "@app/client/src/sketch/save";
import { SketchGallery } from "@app/client/src/components/SketchGallery";
import type { Stroke } from "@app/client/src/sketch/sketchReducer";
import { task } from "../helpers";

const pts = [{ x: 0, y: 0, pressure: 0.2 }, { x: 10, y: 10, pressure: 0.6 }, { x: 20, y: 0, pressure: 1 }];
const stroke = (tool: Stroke["tool"]): Stroke => ({ tool, color: "#2F45C2", size: 4, points: pts });

describe("strokeToSaved", () => {
  it("saves a pen stroke", () => {
    expect(strokeToSaved(stroke("pen"), "pen")).toEqual({ d: "M 0 0 Q 10 10 15 5 L 20 0", width: 4.52, color: "#2F45C2", opacity: 1 });
  });
  it("makes markers wide and see-through, erasers white", () => {
    expect(strokeToSaved(stroke("marker"), "mouse")).toMatchObject({ width: 12, opacity: 0.35, color: "#2F45C2" });
    expect(strokeToSaved(stroke("eraser"), "mouse")).toMatchObject({ width: 16, opacity: 1, color: "#FFFFFF" });
  });
});

describe("SketchGallery", () => {
  const sketches = [
    { id: "s1", title: "Flow", taskId: "t1", width: 400, height: 300, createdAt: "2026-11-01", strokes: [{ d: "M 0 0 L 9 9", color: "#000", width: 2, opacity: 1 }, { d: "M 1 1 L 5 5", color: "#f00", width: 6, opacity: 0.35 }] },
    { id: "s2", title: "Chart idea", taskId: null, width: 400, height: 300, createdAt: "2026-11-02", strokes: [] },
  ];
  it("shows thumbnails with their strokes", () => {
    render(<SketchGallery sketches={sketches} tasks={[task("t1", { title: "Onboarding" })]} onOpen={() => {}} onDelete={() => {}} />);
    const list = screen.getByRole("list", { name: "Saved sketches" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    const paths = screen.getByRole("button", { name: "Flow" }).querySelectorAll("path");
    expect(paths).toHaveLength(2);
    expect(paths[1]).toHaveAttribute("stroke-opacity", "0.35");
    expect(screen.getByText("Onboarding")).toBeInTheDocument();
    expect(screen.getByText("No task")).toBeInTheDocument();
  });
  it("opens and deletes", async () => {
    const onOpen = vi.fn(), onDelete = vi.fn();
    render(<SketchGallery sketches={sketches} tasks={[]} onOpen={onOpen} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: "Chart idea" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete Flow" }));
    expect(onOpen).toHaveBeenCalledWith("s2");
    expect(onDelete).toHaveBeenCalledWith("s1");
  });
  it("explains an empty gallery", () => {
    render(<SketchGallery sketches={[]} tasks={[]} onOpen={() => {}} onDelete={() => {}} />);
    expect(screen.getByText("No sketches yet. Draw something and save it.")).toBeInTheDocument();
  });
});
