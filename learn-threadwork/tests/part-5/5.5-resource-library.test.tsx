// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResourceLibrary, type ResourceLibraryProps } from "@app/client/src/components/ResourceLibrary";
import { task } from "../helpers";

function setup(extra: Partial<ResourceLibraryProps> = {}) {
  const props: ResourceLibraryProps = {
    resources: [{ id: "r1", name: "Budget sheet", kind: "file", url: "" }, { id: "r2", name: "Minh", kind: "person", url: "" }],
    tasks: [task("t1", { title: "Proposal" }), task("t2", { title: "Survey" })],
    usage: { r1: { taskIds: ["t1", "t2"], usedIn: 1 }, r2: { taskIds: [], usedIn: 0 } },
    onAdd: vi.fn(), onRemove: vi.fn(), onOpenTask: vi.fn(), ...extra };
  render(<ResourceLibrary {...props} />);
  return props;
}

describe("ResourceLibrary", () => {
  it("adds a resource and clears the form", async () => {
    const p = setup();
    await userEvent.type(screen.getByLabelText("Name"), "Style guide");
    await userEvent.selectOptions(screen.getByLabelText("Kind"), "book");
    await userEvent.type(screen.getByLabelText("Link"), "https://x.dev");
    await userEvent.click(screen.getByRole("button", { name: "Add resource" }));
    expect(p.onAdd).toHaveBeenCalledWith("Style guide", "book", "https://x.dev");
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Kind")).toHaveValue("link");
  });
  it("needs a name", async () => {
    const p = setup();
    await userEvent.click(screen.getByRole("button", { name: "Add resource" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Give the resource a name");
    expect(p.onAdd).not.toHaveBeenCalled();
  });
  it("shows usage and opens tasks", async () => {
    const p = setup();
    const row = screen.getByRole("row", { name: /Budget sheet/ });
    expect(within(row).getByText("Used in 1 of 2 tasks")).toBeInTheDocument();
    await userEvent.click(within(row).getByRole("button", { name: "Survey" }));
    expect(p.onOpenTask).toHaveBeenCalledWith("t2");
    await userEvent.click(screen.getByRole("button", { name: "Delete Minh" }));
    expect(p.onRemove).toHaveBeenCalledWith("r2");
  });
  it("explains the empty library", () => {
    setup({ resources: [], usage: {} });
    expect(screen.getByText(/No resources yet/)).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });
});
