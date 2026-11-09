import { resourcesReducer, resourceUsage, type ResourceAction } from "@app/shared/resources";
import type { AppState } from "@app/shared/types";
import { appState, task, deepFreeze } from "../helpers";

const run = (actions: ResourceAction[], s: AppState) => actions.reduce((st, a) => resourcesReducer(deepFreeze(st), a), s);
const base = () => appState({ tasks: [task("t1"), task("t2")], resources: [{ id: "r1", name: "Budget sheet", kind: "file", url: "" }] });

describe("resourcesReducer", () => {
  it("adds trimmed resources and ignores empty names", () => {
    const s = run([{ type: "addResource", id: "r2", name: "  Style guide ", kind: "link", url: " https://x.dev " }, { type: "addResource", id: "r3", name: "  ", kind: "tool", url: "" }], base());
    expect(s.resources.map(r => r.id)).toEqual(["r1", "r2"]);
    expect(s.resources[1]).toEqual({ id: "r2", name: "Style guide", kind: "link", url: "https://x.dev" });
  });
  it("attaches once, only known resources", () => {
    const s = run([{ type: "attachResource", taskId: "t1", resourceId: "r1" }, { type: "attachResource", taskId: "t1", resourceId: "r1" }, { type: "attachResource", taskId: "t1", resourceId: "nope" }], base());
    expect(s.tasks[0]!.resources).toEqual([{ resourceId: "r1", used: false }]);
  });
  it("marks used and detaches", () => {
    const s = run([{ type: "attachResource", taskId: "t1", resourceId: "r1" }, { type: "markResourceUsed", taskId: "t1", resourceId: "r1", used: true }], base());
    expect(s.tasks[0]!.resources).toEqual([{ resourceId: "r1", used: true }]);
    expect(run([{ type: "detachResource", taskId: "t1", resourceId: "r1" }], s).tasks[0]!.resources).toEqual([]);
  });
  it("removing a resource also removes it from tasks", () => {
    const s = run([{ type: "attachResource", taskId: "t2", resourceId: "r1" }, { type: "removeResource", id: "r1" }], base());
    expect(s.resources).toEqual([]);
    expect(s.tasks[1]!.resources).toEqual([]);
  });
  it("returns the same state for other actions", () => {
    const s = base();
    expect(resourcesReducer(s, { type: "other" } as unknown as ResourceAction)).toBe(s);
  });
});

describe("resourceUsage", () => {
  it("lists tasks and counts uses", () => {
    const s = appState({
      resources: [{ id: "r1", name: "A", kind: "file", url: "" }, { id: "r2", name: "B", kind: "book", url: "" }],
      tasks: [task("t1", { resources: [{ resourceId: "r1", used: true }] }), task("t2", { resources: [{ resourceId: "r1", used: false }] })],
    });
    expect(resourceUsage(s)).toEqual({ r1: { taskIds: ["t1", "t2"], usedIn: 1 }, r2: { taskIds: [], usedIn: 0 } });
  });
});
