// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteEditor, type NoteEditorProps } from "@app/client/src/components/NoteEditor";
import type { Note } from "@app/shared/types";
import { task } from "../helpers";

const note = (extra: Partial<Note> = {}): Note => ({ id: "n", kind: "note", title: "Call bank", body: "Friday", rows: [], taskId: null, updatedAt: 0, ...extra });
function setup(n: Note) {
  const props: NoteEditorProps = { note: n, tasks: [task("t1", { title: "Budget" }), task("t2", { title: "Trip" })], onEdit: vi.fn(), onSetCell: vi.fn(),
    onAddRow: vi.fn(), onAddColumn: vi.fn(), onLink: vi.fn(), onToTask: vi.fn(), onDelete: vi.fn() };
  render(<NoteEditor {...props} />);
  return props;
}

describe("NoteEditor", () => {
  it("edits title and text", () => {
    const p = setup(note());
    expect(screen.getByRole("region", { name: "Note editor" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Call the bank" } });
    expect(p.onEdit).toHaveBeenCalledWith({ title: "Call the bank" });
    fireEvent.change(screen.getByLabelText("Text"), { target: { value: "Before Friday" } });
    expect(p.onEdit).toHaveBeenCalledWith({ body: "Before Friday" });
  });
  it("links to a task or none", async () => {
    const p = setup(note({ taskId: "t1" }));
    const select = screen.getByLabelText("Task");
    expect(select).toHaveValue("t1");
    expect(within(select).getAllByRole("option").map(o => o.textContent)).toEqual(["No task", "Budget", "Trip"]);
    await userEvent.selectOptions(select, "t2");
    await userEvent.selectOptions(select, "");
    expect(p.onLink).toHaveBeenNthCalledWith(1, "t2");
    expect(p.onLink).toHaveBeenNthCalledWith(2, null);
  });
  it("notes can become tasks; drafts can't", async () => {
    const p = setup(note());
    await userEvent.click(screen.getByRole("button", { name: "Turn into task" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete note" }));
    expect(p.onToTask).toHaveBeenCalled();
    expect(p.onDelete).toHaveBeenCalled();
  });
  it("drafts have text but no task button", () => {
    setup(note({ kind: "draft" }));
    expect(screen.getByLabelText("Text")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Turn into task" })).toBeNull();
  });
  it("edits tables cell by cell", async () => {
    const p = setup(note({ kind: "table", rows: [["Q", "Yes"], ["Lost", "62"]] }));
    expect(screen.queryByLabelText("Text")).toBeNull();
    expect(screen.getByLabelText("Row 2, column 2")).toHaveValue("62");
    fireEvent.change(screen.getByLabelText("Row 2, column 1"), { target: { value: "Felt lost" } });
    expect(p.onSetCell).toHaveBeenCalledWith(1, 0, "Felt lost");
    await userEvent.click(screen.getByRole("button", { name: "Add row" }));
    await userEvent.click(screen.getByRole("button", { name: "Add column" }));
    expect(p.onAddRow).toHaveBeenCalled();
    expect(p.onAddColumn).toHaveBeenCalled();
  });
});
