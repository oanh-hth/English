// Exercise 6.1: Stroke width, simplifying and smooth paths. Read curriculum/part-6/a-stroke-geometry.md first.

export interface Point { x: number; y: number; pressure: number }
export type PointerKind = "pen" | "touch" | "mouse";

/**
 * Line width for a point. Only a pen has real pressure; use 0.5 for touch and mouse.
 * width = size * (0.35 + pressure * 1.3), rounded to 2 decimals.
 */
export function strokeWidth(size: number, pressure: number, kind: PointerKind): number {
  // TODO 6.1
  throw new Error("TODO 6.1");
}

/** Straight-line distance between two points. */
export function distance(a: Point, b: Point): number {
  // TODO 6.1
  throw new Error("TODO 6.1");
}

/**
 * Drops points closer than `minDistance` to the last KEPT point. Always keeps the first and the last point.
 * Pencils send 120+ points per second, so this keeps saved sketches small.
 */
export function simplify(points: readonly Point[], minDistance: number): Point[] {
  // TODO 6.1
  throw new Error("TODO 6.1");
}

/**
 * An SVG path that curves smoothly through the points:
 * - 0 points: ""   - 1 point: "M x y"   - 2 points: "M x0 y0 L x1 y1"
 * - more: "M x0 y0", then for each middle point i (1..n-2): " Q xi yi mx my" where (mx, my) is the midpoint of
 *   point i and point i+1, then " L" to the last point.
 * Round every number to 1 decimal (use Number(n.toFixed(1)) so 3.0 prints as 3).
 */
export function toSvgPath(points: readonly Point[]): string {
  // TODO 6.1
  throw new Error("TODO 6.1");
}
