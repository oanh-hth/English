// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskCard } from "@app/client/src/components/TaskCard";
import { task } from "./helpers";

describe("3.1 TaskCard", () => {
  it("shows the title as a heading inside a button", () => {
    render(<TaskCard task={task("a", { title: "Write brief" })} today="2026-11-08" onOpen={() => {}} />);
    const btn = screen.getByRole("button", { name: /write brief/i });
    expect(btn).toContainElement(screen.getByRole("heading", { name: "Write brief" }));
  });
  it("shows importance, due date, links and resources", () => {
    render(<TaskCard today="2026-11-08" onOpen={() => {}}
      task={task("a", { importance: "high", due: "2026-11-09", links: ["b", "c"], resources: [{ resourceId: "r", used: false }] })} />);
    expect(screen.getByText("High")).toHaveClass("pill", "high");
    expect(screen.getByText("Due tomorrow")).toBeInTheDocument();
    expect(screen.getByText("2 linked")).toBeInTheDocument();
    expect(screen.getByText("1 resource")).toBeInTheDocument();
  });
  it("hides empty details", () => {
    render(<TaskCard task={task("a")} today="2026-11-08" onOpen={() => {}} />);
    expect(screen.queryByText(/linked/)).toBeNull();
    expect(screen.queryByText(/resource/)).toBeNull();
    expect(screen.queryByText(/Due/)).toBeNull();
  });
  it("marks the status and opens on click", async () => {
    const onOpen = vi.fn();
    render(<TaskCard task={task("a", { status: "done" })} today="2026-11-08" onOpen={onOpen} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-status", "done");
    await userEvent.click(btn);
    expect(onOpen).toHaveBeenCalledWith("a");
  });
});
