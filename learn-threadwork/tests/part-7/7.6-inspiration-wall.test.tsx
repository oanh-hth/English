// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InspirationWall, type InspirationWallProps } from "@app/client/src/components/InspirationWall";
import { task } from "../helpers";

function setup(extra: Partial<InspirationWallProps> = {}) {
  const props: InspirationWallProps = {
    pins: [{ id: "q1", type: "quote", text: "Small steps add up.", author: "Me" }, { id: "g1", type: "goal", text: "Lead the project" }, { id: "q2", type: "quote", text: "Keep going.", author: "" }],
    wins: Array.from({ length: 14 }, (_, i) => task(`w${i}`, { title: `Win ${i}` })),
    onAddQuote: vi.fn(), onAddGoal: vi.fn(), onRemove: vi.fn(), onMove: vi.fn(), ...extra };
  render(<InspirationWall {...props} />);
  return props;
}

describe("InspirationWall", () => {
  it("shows quotes and goals", () => {
    setup();
    const items = within(screen.getByRole("list", { name: "Pins" })).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(within(items[0]!).getByText("Me").tagName).toBe("CITE");
    expect(items[1]).toHaveTextContent("Goal: Lead the project");
    expect(items[2]!.querySelector("cite")).toBeNull();
  });
  it("moves and removes pins", async () => {
    const p = setup();
    const items = within(screen.getByRole("list", { name: "Pins" })).getAllByRole("listitem");
    expect(within(items[0]!).getByRole("button", { name: "Move up" })).toBeDisabled();
    expect(within(items[2]!).getByRole("button", { name: "Move down" })).toBeDisabled();
    await userEvent.click(within(items[1]!).getByRole("button", { name: "Move up" }));
    await userEvent.click(within(items[2]!).getByRole("button", { name: "Remove" }));
    expect(p.onMove).toHaveBeenCalledWith("g1", -1);
    expect(p.onRemove).toHaveBeenCalledWith("q2");
  });
  it("pins quotes and goals", async () => {
    const p = setup();
    await userEvent.type(screen.getByLabelText("Quote"), "Done is better than perfect");
    await userEvent.type(screen.getByLabelText("Who said it"), "Sheryl Sandberg");
    await userEvent.click(screen.getByRole("button", { name: "Pin quote" }));
    expect(p.onAddQuote).toHaveBeenCalledWith("Done is better than perfect", "Sheryl Sandberg");
    expect(screen.getByLabelText("Quote")).toHaveValue("");
    await userEvent.click(screen.getByRole("button", { name: "Pin goal" }));
    expect(p.onAddGoal).not.toHaveBeenCalled();
    await userEvent.type(screen.getByLabelText("Goal"), "Speak up in meetings");
    await userEvent.click(screen.getByRole("button", { name: "Pin goal" }));
    expect(p.onAddGoal).toHaveBeenCalledWith("Speak up in meetings");
  });
  it("shows the 12 newest wins", () => {
    setup();
    const wins = within(screen.getByRole("list", { name: "Wins" })).getAllByRole("listitem");
    expect(wins).toHaveLength(12);
    expect(wins[0]).toHaveTextContent("Win 0");
  });
  it("encourages the first win", () => {
    setup({ wins: [] });
    expect(screen.getByText("Finish a task to pin your first win.")).toBeInTheDocument();
  });
});
