// Exercise 5.2: the maths behind smooth pencil lines. See curriculum/phase-5-graphics-and-pencil/5.2-stroke-geometry.md

export interface Point { x: number; y: number; pressure: number }
export type PointerKind = "pen" | "touch" | "mouse";

/**
 * Line width for a point. Only a pen has real pressure; use 0.5 for touch and mouse.
 * width = size * (0.35 + pressure * 1.3), rounded to 2 decimals.
 */
export function strokeWidth(size: number, pressure: number, kind: PointerKind): number {
  // TODO 5.2
  throw new Error("TODO 5.2");
}

/** Straight-line distance between two points. */
export function distance(a: Point, b: Point): number {
  // TODO 5.2
  throw new Error("TODO 5.2");
}

/**
 * Drops points closer than `minDistance` to the last KEPT point. Always keeps the first and the last point.
 * Pencils send 120+ points per second, so this keeps saved sketches small.
 */
export function simplify(points: readonly Point[], minDistance: number): Point[] {
  // TODO 5.2
  throw new Error("TODO 5.2");
}

/**
 * An SVG path that curves smoothly through the points:
 * - 0 points: ""   - 1 point: "M x y"   - 2 points: "M x0 y0 L x1 y1"
 * - more: "M x0 y0", then for each middle point i (1..n-2): " Q xi yi mx my" where (mx, my) is the midpoint of
 *   point i and point i+1, then " L" to the last point.
 * Round every number to 1 decimal (use Number(n.toFixed(1)) so 3.0 prints as 3).
 */
export function toSvgPath(points: readonly Point[]): string {
  // TODO 5.2
  throw new Error("TODO 5.2");
}
