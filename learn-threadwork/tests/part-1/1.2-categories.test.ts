import { CATEGORIES, GROUPS, categoriesByGroup, categoryById, isCategoryId } from "@app/shared/categories";

describe("1.2 categories", () => {
  it("knows category ids", () => {
    expect(isCategoryId("react")).toBe(true);
    expect(isCategoryId("accessibility")).toBe(true);
    for (const v of ["React", "cooking", "", 3, null, undefined]) expect(isCategoryId(v)).toBe(false);
  });
  it("finds a category by id", () => {
    expect(categoryById("layout")).toEqual({ id: "layout", name: "Layout (Flexbox, Grid)", group: "Frontend" });
    expect(categoryById("nope")).toBeUndefined();
  });
  it("groups categories for a menu, in order", () => {
    const g = categoriesByGroup();
    expect(Object.keys(g)).toEqual([...GROUPS]);
    expect(g.Frontend[0]!.id).toBe("html");
    expect(g.Backend.map(c => c.id)).toEqual(["node", "apis", "auth", "databases", "backend-testing", "server-security"]);
    expect(g.Frontend.length + g.Backend.length + g.Workflow.length).toBe(CATEGORIES.length);
  });
  it("returns new arrays every time", () => {
    expect(categoriesByGroup().Frontend).not.toBe(categoriesByGroup().Frontend);
  });
});
