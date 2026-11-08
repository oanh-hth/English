// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskDrawer, type TaskDrawerProps } from "@app/client/src/components/TaskDrawer";
import { task } from "./helpers";

const all = [task("a", { title: "Alpha", links: ["b"], importance: "high" }), task("b", { title: "Beta", links: ["a"] }), task("c", { title: "Gamma" })];
function setup(extra: Partial<TaskDrawerProps> = {}) {
  const props: TaskDrawerProps = { task: all[0]!, allTasks: all, onClose: vi.fn(), onRename: vi.fn(), onSetImportance: vi.fn(),
    onLink: vi.fn(), onUnlink: vi.fn(), onComplete: vi.fn(), ...extra };
  const view = render(<TaskDrawer {...props} />);
  return { props, ...view };
}

describe("3.4 TaskDrawer", () => {
  it("is a dialog that closes with the button and Escape", async () => {
    const { props } = setup();
    expect(screen.getByRole("dialog", { name: "Task details" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await userEvent.keyboard("{Escape}");
    expect(props.onClose).toHaveBeenCalledTimes(2);
  });
  it("renames on blur, ignores empty titles", async () => {
    const { props } = setup();
    const input = screen.getByLabelText("Title");
    await userEvent.clear(input); await userEvent.type(input, "Alpha v2"); await userEvent.tab();
    expect(props.onRename).toHaveBeenCalledWith("a", "Alpha v2");
    await userEvent.clear(input); await userEvent.tab();
    expect(props.onRename).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("Alpha");
  });
  it("renames on Enter only when changed", async () => {
    const { props } = setup();
    await userEvent.type(screen.getByLabelText("Title"), "{Enter}");
    expect(props.onRename).not.toHaveBeenCalled();
    await userEvent.type(screen.getByLabelText("Title"), "!{Enter}");
    expect(props.onRename).toHaveBeenCalledWith("a", "Alpha!");
  });
  it("sets importance with growth labels", async () => {
    const { props } = setup();
    const select = screen.getByLabelText("Importance");
    expect(within(select).getAllByRole("option").map(o => o.textContent)).toEqual(["Low · +8%", "Medium · +15%", "High · +25%", "Critical · +40%"]);
    expect(select).toHaveValue("high");
    await userEvent.selectOptions(select, "critical");
    expect(props.onSetImportance).toHaveBeenCalledWith("a", "critical");
  });
  it("links and unlinks", async () => {
    const { props } = setup();
    const select = screen.getByLabelText("Link to another task");
    expect(within(select).getAllByRole("option").map(o => o.textContent)).toEqual(["Choose a task…", "Gamma"]);
    await userEvent.selectOptions(select, "c");
    expect(props.onLink).toHaveBeenCalledWith("a", "c");
    expect(select).toHaveValue("");
    await userEvent.click(screen.getByRole("button", { name: "Unlink Beta" }));
    expect(props.onUnlink).toHaveBeenCalledWith("a", "b");
  });
  it("completes with the growth amount, or shows when it was done", async () => {
    const { props, rerender } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Complete · +25% growth" }));
    expect(props.onComplete).toHaveBeenCalledWith("a");
    rerender(<TaskDrawer {...props} task={{ ...all[0]!, status: "done", doneAt: "2026-11-08" }} />);
    expect(screen.queryByRole("button", { name: /Complete/ })).toBeNull();
    expect(screen.getByText("Finished on 2026-11-08")).toBeInTheDocument();
  });
  it("shows the new title when another task opens", () => {
    const { props, rerender } = setup();
    rerender(<TaskDrawer {...props} task={all[2]!} />);
    expect(screen.getByLabelText("Title")).toHaveValue("Gamma");
  });
});
