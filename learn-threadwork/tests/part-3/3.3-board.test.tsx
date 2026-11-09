// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Board } from "@app/client/src/components/Board";
import { task } from "../helpers";

const tasks = [task("a", { title: "Alpha" }), task("b", { title: "Beta", status: "doing" }), task("c", { title: "Gamma" })];

describe("3.3 Board", () => {
  it("renders three columns with counts", () => {
    render(<Board tasks={tasks} today="2026-11-08" onOpen={() => {}} onMove={() => {}} />);
    expect(screen.getAllByRole("region").map(r => r.getAttribute("aria-label"))).toEqual(["Inbox", "Doing", "Done"]);
    expect(screen.getByRole("heading", { name: "Inbox (2)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Doing (1)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Done (0)" })).toBeInTheDocument();
  });
  it("puts each task in its column", () => {
    render(<Board tasks={tasks} today="2026-11-08" onOpen={() => {}} onMove={() => {}} />);
    const inbox = screen.getByRole("region", { name: "Inbox" });
    expect(within(inbox).getByRole("heading", { name: "Alpha" })).toBeInTheDocument();
    expect(within(inbox).getByRole("heading", { name: "Gamma" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Done" })).getByText("Nothing here")).toBeInTheDocument();
  });
  it("moves tasks with buttons", async () => {
    const onMove = vi.fn();
    render(<Board tasks={tasks} today="2026-11-08" onOpen={() => {}} onMove={onMove} />);
    await userEvent.click(screen.getByRole("button", { name: "Move Beta to Done" }));
    expect(onMove).toHaveBeenCalledWith("b", "done");
    expect(screen.queryByRole("button", { name: "Move Beta to Doing" })).toBeNull();
  });
  it("opens a task", async () => {
    const onOpen = vi.fn();
    render(<Board tasks={tasks} today="2026-11-08" onOpen={onOpen} onMove={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /^gamma/i }));
    expect(onOpen).toHaveBeenCalledWith("c");
  });
});
