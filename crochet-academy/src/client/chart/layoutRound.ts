import { todo } from '@/shared/todo';
import type { LoopMod, Row, StitchId } from '@/shared/types';

export interface RoundOptions {
  /** Radius of the empty centre. Default 26. */
  hub?: number;
  /** Thickness of each ring (one round). Default 36. */
  ringH?: number;
  /** Space around the outside. Default 16. */
  pad?: number;
}

export interface Wedge {
  rowId: string;
  rowIndex: number;
  /** Position of the stitch in the round (0 = first). */
  index: number;
  /** Which ring this round is drawn on: 0 is the innermost. */
  ring: number;
  st: StitchId;
  mod: LoopMod;
  /** Inner and outer radius of the wedge. */
  r0: number;
  r1: number;
  /** Start and end angle in radians. The chart runs counter-clockwise from the top, so end < start. */
  start: number;
  end: number;
  /** Where the symbol goes, how far to turn it (degrees) so it points outwards, and how big to draw it. */
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface RingLabel {
  rowIndex: number;
  text: string;
  x: number;
  y: number;
}

export interface RoundLayout {
  /** The drawing is a square of this size. */
  size: number;
  center: { x: number; y: number };
  hub: number;
  /** True when some round starts with a magic ring: draw its symbol in the hub. */
  hasMagicRing: boolean;
  wedges: Wedge[];
  labels: RingLabel[];
}

/**
 * Exercise 3.6: a crochet circle is drawn as rings. Round 1 is the small ring in the middle,
 * each later round is a bigger ring around it, and every stitch is a wedge of its ring.
 * Pure geometry again: no React. Use expand() from 1.2.
 *
 * Defaults hub = 26, ringH = 36, pad = 16.
 *  - A magic ring ("mr") is NOT a wedge. It only sets hasMagicRing (it is drawn in the hub).
 *  - A round with no wedges (for example only "mr") gets no ring and does not use up any space.
 *  - Rings are numbered 0, 1, 2... in row order, counting only rounds that have wedges.
 *  - size = (hub + max(1, number of rings) * ringH + pad) * 2, and the centre is (size / 2, size / 2).
 *  - Ring i: r0 = hub + i * ringH + 1.5 and r1 = r0 + ringH - 3 (a small gap between rings). Let rm = (r0 + r1) / 2.
 *  - A ring with n wedges: span = 2 * PI / n (when n is 1 use 2 * PI - 0.001).
 *    Wedge k starts at  start = -PI / 2 - k * span  (the top, going counter-clockwise)  and ends at end = start - span.
 *    mid = (start + end) / 2.
 *  - The symbol sits at x = cx + rm * cos(mid), y = cy + rm * sin(mid),
 *    rotation = (mid + PI / 2) * 180 / PI, scale = clamp(min(ringH * 0.62, span * rm * 0.72) / 17, 0.3, 1.3).
 *  - One label per ring, at the top of its ring: { rowIndex, text: String(rowIndex + 1), x: cx, y: cy - rm }.
 */
export function layoutRound(rows: Row[], options: RoundOptions = {}): RoundLayout {
  // TODO(3.6)
  return todo('3.6');
}
