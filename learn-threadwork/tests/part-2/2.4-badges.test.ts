import { computeStats, earnedBadges, newBadges, type Stats } from "@app/shared/badges";
import { initialGarden } from "@app/shared/garden";
import { task } from "../helpers";

const tasks = [
  task("a", { status: "done", importance: "critical", links: ["b"], resources: [{ resourceId: "r1", used: true }, { resourceId: "r2", used: false }] }),
  task("b", { status: "done", links: ["a", "c"] }),
  task("c", { status: "doing", links: ["b"], resources: [{ resourceId: "r1", used: true }] }),
];
const garden = { ...initialGarden, harvests: [{ kind: "tomato" as const, fruits: 5, day: "2026-11-01" }] };

describe("2.4 badges", () => {
  it("computes stats", () => {
    expect(computeStats(tasks, garden, { streak: 3, lastDone: "2026-11-08" }, 2)).toEqual({
      finished: 2, finishedCritical: 1, linkPairs: 2, resourcesUsed: 2, harvests: 1, streak: 3, focusSessions: 2 });
  });
  it("lists earned badges in order", () => {
    const s = computeStats(tasks, garden, { streak: 3, lastDone: "2026-11-08" }, 2);
    expect(earnedBadges(s)).toEqual(["first-sprout", "first-harvest", "on-a-roll", "big-push"]);
  });
  it("nothing earned at the start", () => {
    expect(earnedBadges(computeStats([], initialGarden, { streak: 0, lastDone: null }, 0))).toEqual([]);
  });
  it("finds newly earned badges", () => {
    const before: Stats = { finished: 0, finishedCritical: 0, linkPairs: 2, resourcesUsed: 0, harvests: 0, streak: 2, focusSessions: 4 };
    const after: Stats = { ...before, finished: 1, linkPairs: 3, focusSessions: 5 };
    expect(newBadges(before, after)).toEqual(["first-sprout", "weaver", "focused"]);
    expect(newBadges(after, after)).toEqual([]);
  });
});
