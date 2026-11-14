// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FolderView } from "@app/client/src/components/FolderView";
import type { Folder } from "@app/shared/folders";

const folder: Folder = { category: "react", name: "React", group: "Frontend", count: 2, latest: "2026-11-14", stickers: ["rocket"], decisions: [
  { taskId: "a", title: "State approach", doneAt: "2026-11-14", result: "Context is enough", decision: "No library", category: "react", sticker: "rocket" },
  { taskId: "b", title: "Forms", doneAt: "2026-11-10", result: "Controlled inputs", decision: "Keep them", category: "react", sticker: null },
] };

describe("8.7 FolderView", () => {
  it("is a named folder with a way back", async () => {
    const onBack = vi.fn();
    render(<FolderView folder={folder} onBack={onBack} onEdit={() => {}} />);
    const region = screen.getByRole("region", { name: "React folder" });
    expect(within(region).getByRole("heading", { level: 2 })).toHaveTextContent("React");
    expect(region).toHaveTextContent("2 decisions");
    await userEvent.click(screen.getByRole("button", { name: "All folders" }));
    expect(onBack).toHaveBeenCalled();
  });
  it("shows each decision as a named note", () => {
    render(<FolderView folder={folder} onBack={() => {}} onEdit={() => {}} />);
    const notes = screen.getAllByRole("article");
    expect(notes.map(n => n.getAttribute("aria-labelledby") && document.getElementById(n.getAttribute("aria-labelledby")!)?.textContent)).toEqual(["State approach", "Forms"]);
    expect(notes[0]).toHaveClass("note");
    expect(notes[0]!.querySelector("time")).toHaveAttribute("datetime", "2026-11-14");
    expect([...notes[1]!.querySelectorAll("dd")].map(d => d.textContent)).toEqual(["Controlled inputs", "Keep them"]);
  });
  it("puts the sticker on notes that have one", () => {
    render(<FolderView folder={folder} onBack={() => {}} onEdit={() => {}} />);
    const [first, second] = screen.getAllByRole("article");
    expect(within(first!).getByRole("img", { name: "Sticker: Shipped" })).toBeInTheDocument();
    expect(within(second!).queryByRole("img")).toBeNull();
  });
  it("tilts notes and opens them for editing", async () => {
    const onEdit = vi.fn();
    render(<FolderView folder={folder} onBack={() => {}} onEdit={onEdit} />);
    expect(screen.getAllByRole("article")[1]!.style.getPropertyValue("--tilt")).toBe("0.8deg");
    await userEvent.click(screen.getByRole("button", { name: "Edit Forms" }));
    expect(onEdit).toHaveBeenCalledWith("b");
  });
});
