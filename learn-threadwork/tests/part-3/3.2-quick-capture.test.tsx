// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickCapture } from "@app/client/src/components/QuickCapture";

describe("3.2 QuickCapture", () => {
  it("adds a trimmed task with Enter and clears the input", async () => {
    const onAdd = vi.fn();
    render(<QuickCapture onAdd={onAdd} />);
    const input = screen.getByLabelText("Capture a task");
    await userEvent.type(input, "  Call the bank {Enter}");
    expect(onAdd).toHaveBeenCalledWith("Call the bank");
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
  });
  it("adds with the Add button", async () => {
    const onAdd = vi.fn();
    render(<QuickCapture onAdd={onAdd} />);
    await userEvent.type(screen.getByLabelText("Capture a task"), "Draft intro");
    await userEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onAdd).toHaveBeenCalledWith("Draft intro");
  });
  it("refuses empty input with a message that clears on typing", async () => {
    const onAdd = vi.fn();
    render(<QuickCapture onAdd={onAdd} />);
    await userEvent.type(screen.getByLabelText("Capture a task"), "   ");
    await userEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Type a task first");
    await userEvent.type(screen.getByLabelText("Capture a task"), "x");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
