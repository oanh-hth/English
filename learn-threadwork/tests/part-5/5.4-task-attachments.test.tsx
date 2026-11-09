// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskAttachments, type TaskAttachmentsProps } from "@app/client/src/components/TaskAttachments";
import { task } from "../helpers";

const resources = [{ id: "r1", name: "Budget sheet", kind: "file" as const, url: "https://sheets.example" }, { id: "r2", name: "Style guide", kind: "book" as const, url: "" }, { id: "r3", name: "Minh", kind: "person" as const, url: "" }];
function setup(extra: Partial<TaskAttachmentsProps> = {}) {
  const props: TaskAttachmentsProps = { task: task("t", { resources: [{ resourceId: "r1", used: true }, { resourceId: "r2", used: false }] }), resources,
    notes: [{ id: "n1", kind: "note", title: "", body: "", rows: [], taskId: "t", updatedAt: 0 }],
    sketches: [{ id: "s1", title: "Flow", taskId: "t", strokes: [], width: 1, height: 1, createdAt: "2026-11-01" }],
    onAttach: vi.fn(), onDetach: vi.fn(), onMarkUsed: vi.fn(), onOpenNote: vi.fn(), onOpenSketch: vi.fn(), onNewNote: vi.fn(), ...extra };
  render(<TaskAttachments {...props} />);
  return props;
}

describe("TaskAttachments", () => {
  it("lists attached resources with links and used ticks", async () => {
    const p = setup();
    const box = screen.getByRole("region", { name: "Attachments" });
    expect(within(box).getByRole("link", { name: "Budget sheet" })).toHaveAttribute("href", "https://sheets.example");
    expect(within(box).getByRole("link", { name: "Budget sheet" })).toHaveAttribute("target", "_blank");
    expect(screen.getByLabelText("Used Budget sheet")).toBeChecked();
    expect(screen.getByLabelText("Used Style guide")).not.toBeChecked();
    await userEvent.click(screen.getByLabelText("Used Style guide"));
    expect(p.onMarkUsed).toHaveBeenCalledWith("r2", true);
    await userEvent.click(screen.getByRole("button", { name: "Remove Budget sheet" }));
    expect(p.onDetach).toHaveBeenCalledWith("r1");
  });
  it("attaches resources that are not attached yet", async () => {
    const p = setup();
    const select = screen.getByLabelText("Attach a resource");
    expect(within(select).getAllByRole("option").map(o => o.textContent)).toEqual(["Choose…", "Minh"]);
    await userEvent.selectOptions(select, "r3");
    expect(p.onAttach).toHaveBeenCalledWith("r3");
  });
  it("shows an empty message", () => {
    setup({ task: task("t") });
    expect(screen.getByText("No resources yet")).toBeInTheDocument();
  });
  it("opens and creates notes and sketches", async () => {
    const p = setup();
    await userEvent.click(screen.getByRole("button", { name: "Untitled note" }));
    await userEvent.click(screen.getByRole("button", { name: "Flow" }));
    await userEvent.click(screen.getByRole("button", { name: "New table" }));
    expect(p.onOpenNote).toHaveBeenCalledWith("n1");
    expect(p.onOpenSketch).toHaveBeenCalledWith("s1");
    expect(p.onNewNote).toHaveBeenCalledWith("table");
  });
});
