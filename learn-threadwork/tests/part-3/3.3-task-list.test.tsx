// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskList } from "@app/client/src/components/TaskList";
import type { Task } from "@app/shared/types";
import { task } from "../helpers";

const handlers = () => ({ onComplete: vi.fn(), onRecord: vi.fn(), onReopen: vi.fn(), onDelete: vi.fn() });

describe("3.3 TaskList", () => {
  it("splits to do and done, with counts, in order", () => {
    const tasks = [task("late", { title: "Late", due: "2026-11-30" }), task("d", { title: "Finished", status: "done", doneAt: "2026-11-13" }), task("soon", { title: "Soon", due: "2026-11-15" })];
    render(<TaskList tasks={tasks} today="2026-11-14" {...handlers()} />);
    const todo = screen.getByRole("region", { name: "To do" });
    expect(within(todo).getByRole("heading", { name: "To do (2)" })).toBeInTheDocument();
    expect(within(todo).getAllByRole("listitem").map(li => li.querySelector(".title")?.textContent)).toEqual(["Soon", "Late"]);
    expect(within(screen.getByRole("region", { name: "Done" })).getByRole("heading", { name: "Done (1)" })).toBeInTheDocument();
  });
  it("passes the handlers to each item", async () => {
    const h = handlers();
    render(<TaskList tasks={[task("a", { title: "Ship it" })]} today="2026-11-14" {...h} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Done: Ship it" }));
    expect(h.onComplete).toHaveBeenCalledWith("a");
  });
  it("shows empty states", () => {
    render(<TaskList tasks={[]} today="2026-11-14" {...handlers()} />);
    expect(screen.getByText("Nothing to do. Capture a task above.")).toBeInTheDocument();
    expect(screen.getByText("Finished tasks appear here.")).toBeInTheDocument();
  });
  it("shows 10 done tasks, then all on request", async () => {
    const done: Task[] = Array.from({ length: 12 }, (_, i) => task(`d${i}`, { status: "done", doneAt: `2026-11-${String(i + 1).padStart(2, "0")}` }));
    render(<TaskList tasks={done} today="2026-11-14" {...handlers()} />);
    const region = screen.getByRole("region", { name: "Done" });
    expect(within(region).getAllByRole("listitem")).toHaveLength(10);
    await userEvent.click(screen.getByRole("button", { name: "Show all 12" }));
    expect(within(region).getAllByRole("listitem")).toHaveLength(12);
    expect(screen.queryByRole("button", { name: /Show all/ })).toBeNull();
  });
});
