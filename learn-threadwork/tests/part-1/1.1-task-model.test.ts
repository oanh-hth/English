import { createTask, isComplexity } from "@app/shared/task-factory";

const id = () => "t1";

describe("1.1 createTask", () => {
  it("creates a simple task to do", () => {
    expect(createTask("Fix the header", id, "2026-11-14")).toEqual({
      id: "t1", title: "Fix the header", complexity: "simple", status: "todo", due: null, createdAt: "2026-11-14", doneAt: null, outcome: null });
  });
  it("trims the title and names empty titles", () => {
    expect(createTask("  Read the CSS spec  ", id, "2026-11-14").title).toBe("Read the CSS spec");
    expect(createTask("   ", id, "2026-11-14").title).toBe("Untitled task");
  });
  it("uses the options", () => {
    expect(createTask("Choose a state library", id, "2026-11-14", { complexity: "complex", due: "2026-11-20" }))
      .toMatchObject({ complexity: "complex", due: "2026-11-20" });
  });
  it("calls makeId for every task", () => {
    let n = 0;
    const next = () => `id-${++n}`;
    expect(createTask("a", next, "2026-11-14").id).toBe("id-1");
    expect(createTask("b", next, "2026-11-14").id).toBe("id-2");
  });
});

describe("1.1 isComplexity", () => {
  it("accepts simple and complex", () => {
    expect(isComplexity("simple")).toBe(true);
    expect(isComplexity("complex")).toBe(true);
  });
  it("rejects anything else", () => {
    for (const v of ["hard", "", "Simple", 1, null, undefined, {}]) expect(isComplexity(v)).toBe(false);
  });
});
