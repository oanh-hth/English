import { foldersOf } from "@app/shared/folders";
import type { Decision } from "@app/shared/decisions";

const d = (taskId: string, category: string, doneAt: string, sticker: string | null = null): Decision =>
  ({ taskId, title: taskId, doneAt, result: "r", decision: "d", category, sticker });

describe("8.5 foldersOf", () => {
  const list = [d("1", "react", "2026-11-14", "idea"), d("2", "node", "2026-11-13", "rocket"), d("3", "react", "2026-11-12", "idea"),
    d("4", "css", "2026-11-11"), d("5", "react", "2026-11-10", "star"), d("6", "react", "2026-11-09", "heart"), d("7", "react", "2026-11-08", "check"), d("8", "old-topic", "2026-11-07", "gotcha")];
  it("makes one folder per used category, in list order, unknown last", () => {
    expect(foldersOf(list).map(f => f.category)).toEqual(["css", "react", "node", "old-topic"]);
  });
  it("fills in name, group, count, latest and decisions", () => {
    const react = foldersOf(list)[1]!;
    expect(react).toMatchObject({ name: "React", group: "Frontend", count: 5, latest: "2026-11-14" });
    expect(react.decisions.map(x => x.taskId)).toEqual(["1", "3", "5", "6", "7"]);
  });
  it("keeps up to 3 distinct stickers, newest first", () => {
    expect(foldersOf(list)[1]!.stickers).toEqual(["idea", "star", "heart"]);
    expect(foldersOf(list)[0]!.stickers).toEqual([]);
  });
  it("labels unknown categories", () => {
    expect(foldersOf(list)[3]).toMatchObject({ name: "old-topic", group: "Other", count: 1 });
  });
  it("is empty without decisions", () => expect(foldersOf([])).toEqual([]));
});
