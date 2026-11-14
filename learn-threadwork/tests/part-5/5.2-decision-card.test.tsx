// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DecisionCard } from "@app/client/src/components/DecisionCard";
import type { Decision } from "@app/shared/decisions";

const d: Decision = { taskId: "t1", title: "Board layout", doneAt: "2026-11-12", result: "Flexbox needed wrappers.\nGrid did not.", decision: "Use CSS Grid", category: "layout" };

describe("5.2 DecisionCard", () => {
  it("is an article named by its title", () => {
    render(<DecisionCard decision={d} onCategory={() => {}} onEdit={() => {}} />);
    const card = screen.getByRole("article", { name: "Board layout" });
    expect(within(card).getByRole("heading", { level: 3 })).toHaveTextContent("Board layout");
    expect(card.querySelector("time")).toHaveAttribute("datetime", "2026-11-12");
  });
  it("shows the result and decision", () => {
    render(<DecisionCard decision={d} onCategory={() => {}} onEdit={() => {}} />);
    const terms = [...document.querySelectorAll("dt")].map(e => e.textContent);
    const defs = [...document.querySelectorAll("dd")].map(e => e.textContent);
    expect(terms).toEqual(["Result", "Decision"]);
    expect(defs).toEqual(["Flexbox needed wrappers.\nGrid did not.", "Use CSS Grid"]);
  });
  it("filters by its category and opens for editing", async () => {
    const onCategory = vi.fn(), onEdit = vi.fn();
    render(<DecisionCard decision={d} onCategory={onCategory} onEdit={onEdit} />);
    const cat = screen.getByRole("button", { name: "Show all Layout (Flexbox, Grid) decisions" });
    expect(cat).toHaveTextContent("Layout (Flexbox, Grid)");
    await userEvent.click(cat);
    await userEvent.click(screen.getByRole("button", { name: "Edit Board layout" }));
    expect(onCategory).toHaveBeenCalledWith("layout");
    expect(onEdit).toHaveBeenCalledWith("t1");
  });
  it("falls back to the id for unknown categories", () => {
    render(<DecisionCard decision={{ ...d, category: "old-topic" }} onCategory={() => {}} onEdit={() => {}} />);
    expect(screen.getByRole("button", { name: "Show all old-topic decisions" })).toBeInTheDocument();
  });
});
