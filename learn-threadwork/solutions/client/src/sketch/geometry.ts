export interface Point { x: number; y: number; pressure: number }
export type PointerKind = "pen" | "touch" | "mouse";

export function strokeWidth(size: number, pressure: number, kind: PointerKind): number {
  const p = kind === "pen" ? pressure : 0.5;
  return Number((size * (0.35 + p * 1.3)).toFixed(2));
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function simplify(points: readonly Point[], minDistance: number): Point[] {
  if (points.length <= 2) return [...points];
  const out: Point[] = [points[0]!];
  for (let i = 1; i < points.length - 1; i++) {
    if (distance(out[out.length - 1]!, points[i]!) >= minDistance) out.push(points[i]!);
  }
  out.push(points[points.length - 1]!);
  return out;
}

const r = (n: number) => Number(n.toFixed(1));

export function toSvgPath(points: readonly Point[]): string {
  if (points.length === 0) return "";
  const [first] = points;
  let d = `M ${r(first!.x)} ${r(first!.y)}`;
  if (points.length === 1) return d;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]!, q = points[i + 1]!;
    d += ` Q ${r(p.x)} ${r(p.y)} ${r((p.x + q.x) / 2)} ${r((p.y + q.y) / 2)}`;
  }
  const last = points[points.length - 1]!;
  return `${d} L ${r(last.x)} ${r(last.y)}`;
}
