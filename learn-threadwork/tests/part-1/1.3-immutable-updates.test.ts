import { linkTasks, unlinkTasks, moveTask, deleteTask, setResourceUsed } from "@app/shared/task-ops";
import { task, frozen } from "../helpers";

const list = () => frozen([task("a"), task("b"), task("c")]);
const byId = <T extends { id: string }>(ts: T[], id: string): T => ts.find(t => t.id === id)!;

describe("1.3 linkTasks / unlinkTasks", () => {
  it("links both ways without mutating", () => {
    const out = linkTasks(list(), "a", "b");
    expect(byId(out, "a").links).toEqual(["b"]);
    expect(byId(out, "b").links).toEqual(["a"]);
    expect(byId(out, "c").links).toEqual([]);
  });
  it("does not duplicate links", () => {
    const once = linkTasks(list(), "a", "b");
    const twice = linkTasks(frozen(once), "b", "a");
    expect(byId(twice, "a").links).toEqual(["b"]);
  });
  it("ignores self links and unknown ids", () => {
    const l = list();
    expect(linkTasks(l, "a", "a")).toEqual(l);
    expect(linkTasks(l, "a", "zzz")).toEqual(l);
  });
  it("unlinks both ways", () => {
    const linked = frozen(linkTasks(list(), "a", "b"));
    const out = unlinkTasks(linked, "b", "a");
    expect(byId(out, "a").links).toEqual([]);
    expect(byId(out, "b").links).toEqual([]);
  });
});

describe("1.3 moveTask", () => {
  it("sets doneAt when done", () => {
    const out = moveTask(list(), "b", "done", "2026-11-08");
    expect(byId(out, "b")).toMatchObject({ status: "done", doneAt: "2026-11-08" });
  });
  it("clears doneAt when moved back", () => {
    const done = frozen(moveTask(list(), "b", "done", "2026-11-08"));
    expect(byId(moveTask(done, "b", "doing", "2026-11-09"), "b")).toMatchObject({ status: "doing", doneAt: null });
  });
  it("keeps the original done day if already done", () => {
    const done = frozen(moveTask(list(), "b", "done", "2026-11-08"));
    expect(byId(moveTask(done, "b", "done", "2026-11-09"), "b").doneAt).toBe("2026-11-08");
  });
  it("leaves the list alone for unknown ids", () => {
    expect(moveTask(list(), "nope", "done", "2026-11-08")).toEqual(list());
  });
});

describe("1.3 deleteTask", () => {
  it("removes the task and links to it", () => {
    const linked = frozen(linkTasks(linkTasks(list(), "a", "b"), "c", "b"));
    const out = deleteTask(linked, "b");
    expect(out.map(t => t.id)).toEqual(["a", "c"]);
    expect(out.every(t => t.links.length === 0)).toBe(true);
  });
});

describe("1.3 setResourceUsed", () => {
  it("attaches a resource when missing", () => {
    const out = setResourceUsed(frozen(task("a")), "r1", true);
    expect(out.resources).toEqual([{ resourceId: "r1", used: true }]);
  });
  it("updates an attached resource", () => {
    const t = frozen(task("a", { resources: [{ resourceId: "r1", used: false }, { resourceId: "r2", used: false }] }));
    expect(setResourceUsed(t, "r2", true).resources).toEqual([{ resourceId: "r1", used: false }, { resourceId: "r2", used: true }]);
  });
});
