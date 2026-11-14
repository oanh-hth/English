// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskItem, type TaskItemProps } from "@app/client/src/components/TaskItem";
import type { Task } from "@app/shared/types";
import { task, decided } from "../helpers";

function setup(t: Task) {
  const props: TaskItemProps = { task: t, today: "2026-11-14", onComplete: vi.fn(), onRecord: vi.fn(), onReopen: vi.fn(), onDelete: vi.fn() };
  render(<ul><TaskItem {...props} /></ul>);
  return props;
}

describe("3.1 TaskItem", () => {
  it("ticks a simple task done", async () => {
    const p = setup(task("a", { title: "Fix the header", due: "2026-11-15" }));
    expect(screen.getByRole("listitem")).toHaveAttribute("data-status", "todo");
    expect(screen.getByText("Due tomorrow")).toBeInTheDocument();
    expect(screen.queryByText("Complex")).toBeNull();
    await userEvent.click(screen.getByRole("checkbox", { name: "Done: Fix the header" }));
    expect(p.onComplete).toHaveBeenCalledWith("a");
  });
  it("asks for the result of a complex task", async () => {
    const p = setup(task("b", { title: "Choose a router", complexity: "complex" }));
    expect(screen.getByText("Complex")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Record result for Choose a router" }));
    expect(p.onRecord).toHaveBeenCalledWith("b");
  });
  it("shows the decision and category of a decided task", async () => {
    const p = setup(decided("c", "2026-11-12", { category: "layout", decision: "Use CSS Grid" }, "Board layout"));
    expect(screen.getByRole("listitem")).toHaveAttribute("data-complexity", "complex");
    expect(screen.getByText("Done 2026-11-12")).toBeInTheDocument();
    expect(screen.getByText("Layout (Flexbox, Grid)")).toBeInTheDocument();
    expect(screen.getByText("Use CSS Grid")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Edit result for Board layout" }));
    await userEvent.click(screen.getByRole("button", { name: "Reopen Board layout" }));
    expect(p.onRecord).toHaveBeenCalledWith("c");
    expect(p.onReopen).toHaveBeenCalledWith("c");
  });
  it("done simple tasks can be reopened, not edited", () => {
    setup(task("d", { title: "Reply", status: "done", doneAt: "2026-11-14" }));
    expect(screen.getByRole("button", { name: "Reopen Reply" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Edit result/ })).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
  it("deletes", async () => {
    const p = setup(task("e", { title: "Old idea" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete Old idea" }));
    expect(p.onDelete).toHaveBeenCalledWith("e");
  });
});
