import { strokeWidth, distance, simplify, toSvgPath, type Point } from "@app/client/src/sketch/geometry";

const p = (x: number, y: number, pressure = 0.5): Point => ({ x, y, pressure });

describe("5.2 strokeWidth", () => {
  it("uses pencil pressure", () => {
    expect(strokeWidth(4, 1, "pen")).toBe(6.6);
    expect(strokeWidth(4, 0.1, "pen")).toBe(1.92);
  });
  it("ignores pressure for touch and mouse", () => {
    expect(strokeWidth(4, 1, "touch")).toBe(4);
    expect(strokeWidth(4, 0, "mouse")).toBe(4);
  });
});

describe("5.2 distance / simplify", () => {
  it("measures distance", () => expect(distance(p(0, 0), p(3, 4))).toBe(5));
  it("drops points that are too close", () => {
    const pts = [p(0, 0), p(1, 0), p(2, 0), p(5, 0), p(5.5, 0), p(9, 0), p(9.2, 0)];
    expect(simplify(pts, 3).map(q => q.x)).toEqual([0, 5, 9, 9.2]);
  });
  it("keeps short lines as they are", () => {
    expect(simplify([p(0, 0), p(0.1, 0)], 3)).toHaveLength(2);
    expect(simplify([], 3)).toEqual([]);
  });
  it("does not mutate the input", () => {
    const pts = Object.freeze([p(0, 0), p(1, 0), p(9, 0)]);
    expect(() => simplify(pts, 3)).not.toThrow();
  });
});

describe("5.2 toSvgPath", () => {
  it("handles 0, 1 and 2 points", () => {
    expect(toSvgPath([])).toBe("");
    expect(toSvgPath([p(1, 2)])).toBe("M 1 2");
    expect(toSvgPath([p(1, 2), p(3.25, 4)])).toBe("M 1 2 L 3.3 4");
  });
  it("curves through middle points", () => {
    expect(toSvgPath([p(0, 0), p(10, 10), p(20, 0), p(30, 10)])).toBe("M 0 0 Q 10 10 15 5 Q 20 0 25 5 L 30 10");
  });
});
