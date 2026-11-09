// Exercise 6.4: Saved strokes and the sketch gallery. Read curriculum/part-6/c-saving-sketches.md first.
import type { SavedStroke } from "@app/shared/types";
import type { PointerKind } from "@app/client/src/sketch/geometry";
import type { Stroke } from "@app/client/src/sketch/sketchReducer";

/**
 * - d: toSvgPath(simplify(points, 1.5)) (from 5.2)
 * - width: strokeWidth(size, average pressure, kind), times 3 for "marker" and 4 for "eraser"
 * - color: the stroke colour, but "#FFFFFF" for the eraser (it paints paper colour)
 * - opacity: 0.35 for "marker", else 1
 */
export function strokeToSaved(stroke: Stroke, kind: PointerKind): SavedStroke {
  // TODO 6.4
  throw new Error("TODO 6.4");
}
