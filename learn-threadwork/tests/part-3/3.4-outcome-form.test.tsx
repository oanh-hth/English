// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OutcomeForm } from "@app/client/src/components/OutcomeForm";
import { task, decided } from "../helpers";

const complexTask = task("a", { title: "Choose a router", complexity: "complex" });

describe("3.4 OutcomeForm", () => {
  it("is a dialog about the task", () => {
    render(<OutcomeForm task={complexTask} onSave={() => {}} onCancel={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: "Record the result" });
    expect(within(dialog).getByRole("heading", { name: "Choose a router" })).toBeInTheDocument();
  });
  it("groups the categories", () => {
    render(<OutcomeForm task={complexTask} onSave={() => {}} onCancel={() => {}} />);
    const select = screen.getByLabelText("Category");
    expect(select).toHaveValue("");
    expect([...select.querySelectorAll("optgroup")].map(g => g.getAttribute("label"))).toEqual(["Frontend", "Backend", "Workflow"]);
    expect(within(select).getByRole("option", { name: "React" })).toHaveValue("react");
  });
  it("saves a valid outcome, trimmed", async () => {
    const onSave = vi.fn();
    render(<OutcomeForm task={complexTask} onSave={onSave} onCancel={() => {}} />);
    await userEvent.type(screen.getByLabelText("Result"), " Hash routing needs no server setup ");
    await userEvent.type(screen.getByLabelText("Decision"), "Use hash routes for now");
    await userEvent.selectOptions(screen.getByLabelText("Category"), "routing");
    await userEvent.click(screen.getByRole("button", { name: "Save decision" }));
    expect(onSave).toHaveBeenCalledWith({ result: "Hash routing needs no server setup", decision: "Use hash routes for now", category: "routing" });
  });
  it("explains what is missing", async () => {
    const onSave = vi.fn();
    render(<OutcomeForm task={complexTask} onSave={onSave} onCancel={() => {}} />);
    await userEvent.type(screen.getByLabelText("Result"), "Tried two libraries");
    await userEvent.click(screen.getByRole("button", { name: "Save decision" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Write down your decision");
    await userEvent.type(screen.getByLabelText("Decision"), "Keep it simple");
    await userEvent.click(screen.getByRole("button", { name: "Save decision" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a category");
    expect(onSave).not.toHaveBeenCalled();
  });
  it("starts from the existing outcome when editing", () => {
    render(<OutcomeForm task={decided("b", "2026-11-10", { result: "R", decision: "D", category: "css" })} onSave={() => {}} onCancel={() => {}} />);
    expect(screen.getByLabelText("Result")).toHaveValue("R");
    expect(screen.getByLabelText("Decision")).toHaveValue("D");
    expect(screen.getByLabelText("Category")).toHaveValue("css");
  });
  it("cancels with the button and Escape", async () => {
    const onCancel = vi.fn();
    render(<OutcomeForm task={complexTask} onSave={() => {}} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await userEvent.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});
