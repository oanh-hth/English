// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FolderShelf } from "@app/client/src/components/FolderShelf";
import type { Folder } from "@app/shared/folders";

const f = (category: string, name: string, group: string, count: number, stickers: string[] = []): Folder =>
  ({ category, name, group, count, latest: "2026-11-14", stickers, decisions: [] });
const folders = [f("css", "CSS", "Frontend", 1), f("react", "React", "Frontend", 3, ["idea", "star"]), f("node", "Node.js", "Backend", 2), f("old", "old", "Other", 1)];

describe("8.6 FolderShelf", () => {
  it("groups folders on shelves in order", () => {
    render(<FolderShelf folders={folders} onOpen={() => {}} />);
    expect(screen.getAllByRole("region").map(r => r.getAttribute("aria-label"))).toEqual(["Frontend", "Backend", "Other"]);
    const fe = screen.getByRole("region", { name: "Frontend" });
    expect(within(fe).getByRole("heading", { name: "Frontend" })).toBeInTheDocument();
    expect(within(fe).getAllByRole("button").map(b => b.getAttribute("aria-label"))).toEqual(["CSS, 1 decision", "React, 3 decisions"]);
  });
  it("draws each folder with its stickers and details", () => {
    render(<FolderShelf folders={folders} onOpen={() => {}} />);
    const react = screen.getByRole("button", { name: "React, 3 decisions" });
    expect(react.querySelector("svg")).not.toBeNull();
    expect(react).toHaveTextContent("3 decisions · latest 2026-11-14");
  });
  it("opens a folder", async () => {
    const onOpen = vi.fn();
    render(<FolderShelf folders={folders} onOpen={onOpen} />);
    await userEvent.click(screen.getByRole("button", { name: "Node.js, 2 decisions" }));
    expect(onOpen).toHaveBeenCalledWith("node");
  });
  it("explains an empty shelf", () => {
    render(<FolderShelf folders={[]} onOpen={() => {}} />);
    expect(screen.getByText(/No decisions yet/)).toBeInTheDocument();
  });
});
