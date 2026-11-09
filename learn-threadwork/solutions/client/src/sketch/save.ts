import type { SavedStroke } from "@app/shared/types";
import { simplify, strokeWidth, toSvgPath, type PointerKind } from "@app/client/src/sketch/geometry";
import type { Stroke } from "@app/client/src/sketch/sketchReducer";

export function strokeToSaved(stroke: Stroke, kind: PointerKind): SavedStroke {
  const avg = stroke.points.reduce((a, p) => a + p.pressure, 0) / Math.max(1, stroke.points.length);
  const scale = stroke.tool === "marker" ? 3 : stroke.tool === "eraser" ? 4 : 1;
  return {
    d: toSvgPath(simplify(stroke.points, 1.5)),
    width: strokeWidth(stroke.size, avg, kind) * scale,
    color: stroke.tool === "eraser" ? "#FFFFFF" : stroke.color,
    opacity: stroke.tool === "marker" ? 0.35 : 1,
  };
}
