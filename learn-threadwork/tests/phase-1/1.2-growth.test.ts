import { GROWTH, growthFor, stageOf, nextStage } from "@app/shared/growth";

describe("1.2 growth", () => {
  it("has a value for every importance", () => {
    expect(GROWTH).toEqual({ low: 8, medium: 15, high: 25, critical: 40 });
  });
  it("growthFor reads the table", () => {
    expect(growthFor("low")).toBe(8);
    expect(growthFor("critical")).toBe(40);
  });
  it.each([
    [0, "Seed"], [4.9, "Seed"], [5, "Sprout"], [14, "Sprout"], [15, "Seedling"], [30, "Young plant"],
    [50, "Flowering"], [64, "Flowering"], [65, "Fruiting"], [80, "Ripening"], [99.9, "Ripening"], [100, "Ready to harvest"],
  ])("stageOf(%s) is %s", (g, name) => {
    expect(stageOf(g)).toBe(name);
  });
  it("clamps out-of-range values", () => {
    expect(stageOf(-10)).toBe("Seed");
    expect(stageOf(140)).toBe("Ready to harvest");
  });
  it("nextStage tells what is missing", () => {
    expect(nextStage(0)).toEqual({ name: "Sprout", missing: 5 });
    expect(nextStage(58)).toEqual({ name: "Fruiting", missing: 7 });
    expect(nextStage(95)).toEqual({ name: "Ready to harvest", missing: 5 });
  });
  it("nextStage is null when ripe", () => {
    expect(nextStage(100)).toBeNull();
    expect(nextStage(120)).toBeNull();
  });
});
