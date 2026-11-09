import { notesReducer, NEW_TABLE, type NoteAction } from "@app/shared/notes";
import type { AppState } from "@app/shared/types";
import { appState, task, deepFreeze } from "../helpers";

const run = (actions: NoteAction[], s: AppState = appState()) => actions.reduce((st, a) => notesReducer(deepFreeze(st), a), s);
const add = (id: string, kind: "note" | "draft" | "table" = "note", taskId: string | null = null): NoteAction => ({ type: "addNote", id, kind, taskId, now: 100 });

describe("notesReducer: adding and editing", () => {
  it("adds notes at the end", () => {
    const s = run([add("n1"), add("n2", "draft", "t1")]);
    expect(s.notes.map(n => n.id)).toEqual(["n1", "n2"]);
    expect(s.notes[1]).toEqual({ id: "n2", kind: "draft", title: "", body: "", rows: [], taskId: "t1", updatedAt: 100 });
  });
  it("starts tables with a fresh copy of NEW_TABLE", () => {
    const s = run([add("t", "table")]);
    expect(s.notes[0]!.rows).toEqual(NEW_TABLE);
    expect(s.notes[0]!.rows).not.toBe(NEW_TABLE);
    expect(s.notes[0]!.rows[0]).not.toBe(NEW_TABLE[0]);
  });
  it("edits only the given fields", () => {
    const s = run([add("n1"), { type: "editNote", id: "n1", title: "Call bank", now: 200 }, { type: "editNote", id: "n1", body: "Before Friday", now: 300 }]);
    expect(s.notes[0]).toMatchObject({ title: "Call bank", body: "Before Friday", updatedAt: 300 });
  });
});

describe("notesReducer: tables", () => {
  it("sets cells and ignores cells outside the table", () => {
    const s = run([add("t", "table"), { type: "setCell", id: "t", row: 1, col: 2, value: "62%", now: 5 }, { type: "setCell", id: "t", row: 9, col: 0, value: "x", now: 6 }]);
    expect(s.notes[0]!.rows[1]).toEqual(["", "", "62%"]);
    expect(s.notes[0]!.rows).toHaveLength(3);
  });
  it("adds rows and columns", () => {
    const s = run([add("t", "table"), { type: "addColumn", id: "t", now: 7 }, { type: "addRow", id: "t", now: 8 }]);
    expect(s.notes[0]!.rows[0]).toEqual(["Item", "Value", "Note", "Column"]);
    expect(s.notes[0]!.rows).toHaveLength(4);
    expect(s.notes[0]!.rows[3]).toEqual(["", "", "", ""]);
    expect(s.notes[0]!.updatedAt).toBe(8);
  });
});

describe("notesReducer: links and tasks", () => {
  it("links, unlinks and deletes", () => {
    const linked = run([add("n1"), { type: "linkNote", id: "n1", taskId: "t9" }]);
    expect(linked.notes[0]!.taskId).toBe("t9");
    expect(run([{ type: "linkNote", id: "n1", taskId: null }], linked).notes[0]!.taskId).toBeNull();
    expect(run([{ type: "deleteNote", id: "n1" }], linked).notes).toEqual([]);
  });
  it("turns a note into a task", () => {
    const s = run([add("n1"), { type: "editNote", id: "n1", body: "\n  Call the bank \nabout the card", now: 2 }, { type: "noteToTask", id: "n1", taskId: "t1", today: "2026-11-08" }],
      appState({ tasks: [task("old")] }));
    expect(s.tasks.map(t => t.id)).toEqual(["t1", "old"]);
    expect(s.tasks[0]).toMatchObject({ title: "Call the bank", details: "\n  Call the bank \nabout the card", createdAt: "2026-11-08" });
    expect(s.notes[0]!.taskId).toBe("t1");
  });
  it("prefers the title, and falls back to \"From note\"", () => {
    const titled = run([add("n1"), { type: "editNote", id: "n1", title: "Plan trip", body: "x", now: 2 }, { type: "noteToTask", id: "n1", taskId: "t1", today: "2026-11-08" }]);
    expect(titled.tasks[0]!.title).toBe("Plan trip");
    const empty = run([add("n1"), { type: "noteToTask", id: "n1", taskId: "t1", today: "2026-11-08" }]);
    expect(empty.tasks[0]!.title).toBe("From note");
  });
  it("detaches notes when their task is deleted", () => {
    const s = run([add("n1", "note", "t1"), add("n2", "note", "t2"), { type: "delete", id: "t1" }]);
    expect(s.notes.map(n => n.taskId)).toEqual([null, "t2"]);
  });
  it("returns the same state for other actions", () => {
    const s = appState();
    expect(notesReducer(s, { type: "somethingElse" } as unknown as NoteAction)).toBe(s);
  });
});
