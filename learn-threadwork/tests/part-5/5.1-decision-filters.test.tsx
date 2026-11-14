// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DecisionFilters, type FilterValue } from "@app/client/src/components/DecisionFilters";

const counts = { react: 3, css: 1, node: 2 };
const empty: FilterValue = { group: null, category: null, text: "" };
const setup = (value: FilterValue) => { const onChange = vi.fn(); render(<DecisionFilters value={value} counts={counts} onChange={onChange} />); return onChange; };
const optionTexts = () => within(screen.getByLabelText("Category")).getAllByRole("option").map(o => o.textContent);

describe("5.1 DecisionFilters", () => {
  it("lists used categories with counts", () => {
    setup(empty);
    expect(screen.getByRole("search", { name: "Filter decisions" })).toBeInTheDocument();
    expect(optionTexts()).toEqual(["All categories", "CSS (1)", "React (3)", "Node.js (2)"]);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
  });
  it("narrows categories to the chosen group", () => {
    setup({ ...empty, group: "Backend" });
    expect(optionTexts()).toEqual(["All categories", "Node.js (2)"]);
    expect(screen.getByRole("button", { name: "Backend" })).toHaveAttribute("aria-pressed", "true");
  });
  it("choosing a group clears the category", async () => {
    const onChange = setup({ ...empty, category: "react", text: "hooks" });
    await userEvent.click(screen.getByRole("button", { name: "Frontend" }));
    expect(onChange).toHaveBeenCalledWith({ group: "Frontend", category: null, text: "hooks" });
  });
  it("chooses and clears a category", async () => {
    const onChange = setup(empty);
    await userEvent.selectOptions(screen.getByLabelText("Category"), "node");
    expect(onChange).toHaveBeenLastCalledWith({ ...empty, category: "node" });
  });
  it("keeps the selected category visible even with no decisions", () => {
    setup({ ...empty, category: "pwa" });
    expect(optionTexts()).toContain("PWA & offline (0)");
  });
  it("searches and clears everything", async () => {
    const onChange = setup({ group: "Frontend", category: "react", text: "" });
    await userEvent.type(screen.getByLabelText("Search decisions"), "g");
    expect(onChange).toHaveBeenLastCalledWith({ group: "Frontend", category: "react", text: "g" });
    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onChange).toHaveBeenLastCalledWith(empty);
  });
});
