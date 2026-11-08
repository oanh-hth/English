import { createTask, isImportance } from "@app/shared/task-factory";

const id = () => "t1";

describe("1.1 createTask", () => {
  it("creates an inbox task with defaults", () => {
    expect(createTask("Write brief", id, "2026-11-08")).toEqual({
      id: "t1", title: "Write brief", status: "inbox", importance: "medium", due: null, details: "",
      links: [], resources: [], createdAt: "2026-11-08", doneAt: null,
    });
  });
  it("trims the title and names empty titles", () => {
    expect(createTask("  Call bank  ", id, "2026-11-08").title).toBe("Call bank");
    expect(createTask("   ", id, "2026-11-08").title).toBe("Untitled task");
  });
  it("uses the options", () => {
    const t = createTask("Ship", id, "2026-11-08", { importance: "critical", due: "2026-11-10", details: "v1" });
    expect(t.importance).toBe("critical");
    expect(t.due).toBe("2026-11-10");
    expect(t.details).toBe("v1");
  });
  it("calls makeId for every task", () => {
    let n = 0;
    const next = () => `id-${++n}`;
    expect(createTask("a", next, "2026-11-08").id).toBe("id-1");
    expect(createTask("b", next, "2026-11-08").id).toBe("id-2");
  });
  it("returns new arrays each time (no shared state)", () => {
    const a = createTask("a", id, "2026-11-08"), b = createTask("b", id, "2026-11-08");
    expect(a.links).not.toBe(b.links);
  });
});

describe("1.1 isImportance", () => {
  it("accepts the four levels", () => {
    for (const v of ["low", "medium", "high", "critical"]) expect(isImportance(v)).toBe(true);
  });
  it("rejects anything else", () => {
    for (const v of ["urgent", "", "LOW", 3, null, undefined, {}]) expect(isImportance(v)).toBe(false);
  });
});
