// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DecisionLog } from "@app/client/src/components/DecisionLog";
import { task, decided } from "../helpers";

const tasks = [
  decided("a", "2026-11-10", { category: "layout", decision: "Use CSS Grid" }, "Board layout"),
  decided("b", "2026-11-12", { category: "react", decision: "Move state into a reducer" }, "State"),
  decided("c", "2026-11-13", { category: "node", decision: "Store data in JSON files" }, "Server storage"),
  task("d"),
];
const titles = () => screen.queryAllByRole("article").map(a => a.querySelector("h3")?.textContent);

describe("5.3 DecisionLog", () => {
  it("lists every decision, newest first, with a count", () => {
    render(<DecisionLog tasks={tasks} onEdit={() => {}} />);
    expect(titles()).toEqual(["Server storage", "State", "Board layout"]);
    expect(screen.getByText("3 decisions")).toBeInTheDocument();
  });
  it("filters by group and by a card's category", async () => {
    render(<DecisionLog tasks={tasks} onEdit={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Frontend" }));
    expect(titles()).toEqual(["State", "Board layout"]);
    await userEvent.click(screen.getByRole("button", { name: "Show all React decisions" }));
    expect(titles()).toEqual(["State"]);
    expect(screen.getByText("1 decision")).toBeInTheDocument();
  });
  it("searches after a short pause", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<DecisionLog tasks={tasks} onEdit={() => {}} />);
    await userEvent.type(screen.getByLabelText("Search decisions"), "grid");
    expect(titles()).toHaveLength(3);
    act(() => { vi.advanceTimersByTime(300); });
    expect(titles()).toEqual(["Board layout"]);
    vi.useRealTimers();
  });
  it("explains when nothing matches, and clears", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<DecisionLog tasks={tasks} onEdit={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Backend" }));
    await userEvent.type(screen.getByLabelText("Search decisions"), "grid");
    act(() => { vi.advanceTimersByTime(300); });
    expect(screen.getByText(/No decisions match these filters/)).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "Clear filters" })[0]!);
    act(() => { vi.advanceTimersByTime(300); });
    expect(titles()).toHaveLength(3);
    vi.useRealTimers();
  });
  it("opens a decision for editing", async () => {
    const onEdit = vi.fn();
    render(<DecisionLog tasks={tasks} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole("button", { name: "Edit State" }));
    expect(onEdit).toHaveBeenCalledWith("b");
  });
  it("explains an empty log", () => {
    render(<DecisionLog tasks={[task("x")]} onEdit={() => {}} />);
    expect(screen.getByText(/No decisions yet/)).toBeInTheDocument();
    expect(screen.queryByRole("search")).toBeNull();
  });
});
