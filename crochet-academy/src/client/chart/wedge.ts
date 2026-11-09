/**
 * PROVIDED: the SVG path of a ring segment ("wedge") between radii r0 and r1, from angle `start` to `end`
 * (radians, measured like SVG: 0 is to the right, positive turns clockwise on screen).
 * Our charts go counter-clockwise from the top, so `end` is smaller than `start`.
 */
export function wedgePath(cx: number, cy: number, r0: number, r1: number, start: number, end: number): string {
  const at = (r: number, t: number): [number, number] => [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  const f = (n: number) => n.toFixed(2);
  const [x0, y0] = at(r1, start);
  const [x1, y1] = at(r1, end);
  const [x2, y2] = at(r0, end);
  const [x3, y3] = at(r0, start);
  const large = Math.abs(end - start) > Math.PI ? 1 : 0;
  return `M${f(x0)} ${f(y0)}A${r1} ${r1} 0 ${large} 0 ${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}A${r0} ${r0} 0 ${large} 1 ${f(x3)} ${f(y3)}Z`;
}
