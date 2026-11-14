// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickCapture } from "@app/client/src/components/QuickCapture";

describe("3.2 QuickCapture", () => {
  it("adds a simple task with Enter and clears", async () => {
    const onAdd = vi.fn();
    render(<QuickCapture onAdd={onAdd} />);
    const input = screen.getByLabelText("Capture a task");
    await userEvent.type(input, "  Reply to Minh {Enter}");
    expect(onAdd).toHaveBeenCalledWith("Reply to Minh", "simple", null);
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
  });
  it("adds a complex task with a due day, then resets the options", async () => {
    const onAdd = vi.fn();
    render(<QuickCapture onAdd={onAdd} />);
    await userEvent.type(screen.getByLabelText("Capture a task"), "Choose a CSS approach");
    await userEvent.click(screen.getByLabelText("Needs a decision"));
    fireEvent.change(screen.getByLabelText("Due"), { target: { value: "2026-11-20" } });
    await userEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onAdd).toHaveBeenCalledWith("Choose a CSS approach", "complex", "2026-11-20");
    expect(screen.getByLabelText("Needs a decision")).not.toBeChecked();
    expect(screen.getByLabelText("Due")).toHaveValue("");
  });
  it("refuses empty input with a message that clears on typing", async () => {
    const onAdd = vi.fn();
    render(<QuickCapture onAdd={onAdd} />);
    await userEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Type a task first");
    await userEvent.type(screen.getByLabelText("Capture a task"), "x");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
