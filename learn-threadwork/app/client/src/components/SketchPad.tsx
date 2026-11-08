// Given: a drawing surface built on your Phase 5 code (geometry.ts and sketchReducer.ts).
// Stretch goal: save sketches and attach them to tasks.
import { useReducer, useRef, useState, type PointerEvent } from "react";
import { sketchReducer, emptySketch, type Tool, type Stroke } from "@app/client/src/sketch/sketchReducer";
import { simplify, strokeWidth, toSvgPath, type Point, type PointerKind } from "@app/client/src/sketch/geometry";

const COLORS = ["#1D2227", "#2F45C2", "#C2412F", "#2C8A57", "#E2A21A"];

function StrokePath({ s, kind }: { s: Stroke; kind: PointerKind }) {
  const avg = s.points.reduce((a, p) => a + p.pressure, 0) / Math.max(1, s.points.length);
  const width = strokeWidth(s.size, avg, kind) * (s.tool === "marker" ? 3 : s.tool === "eraser" ? 4 : 1);
  return <path d={toSvgPath(simplify(s.points, 1.5))} fill="none" strokeLinecap="round" strokeLinejoin="round"
    stroke={s.tool === "eraser" ? "#FFFFFF" : s.color} strokeOpacity={s.tool === "marker" ? 0.35 : 1} strokeWidth={width} />;
}

export function SketchPad() {
  const [state, dispatch] = useReducer(sketchReducer, emptySketch);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]!);
  const [size, setSize] = useState(4);
  const kindRef = useRef<PointerKind>("mouse");
  const svg = useRef<SVGSVGElement>(null);

  const toPoint = (e: { clientX: number; clientY: number; pressure: number }): Point => {
    const r = svg.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, pressure: e.pressure || 0.5 };
  };
  const kindOf = (e: PointerEvent) => (e.pointerType === "pen" || e.pointerType === "touch" ? e.pointerType : "mouse") as PointerKind;

  return (
    <div className="sketch">
      <div className="toolbar" role="toolbar" aria-label="Drawing tools">
        {(["pen", "marker", "eraser"] as Tool[]).map(t => <button key={t} aria-pressed={tool === t} onClick={() => setTool(t)}>{t}</button>)}
        {COLORS.map(c => <button key={c} aria-label={`Colour ${c}`} aria-pressed={color === c} className="swatch" style={{ background: c }} onClick={() => setColor(c)} />)}
        <label>Size <input type="range" min={1} max={20} value={size} onChange={e => setSize(+e.target.value)} /></label>
        <button onClick={() => dispatch({ type: "undo" })}>Undo</button>
        <button onClick={() => dispatch({ type: "redo" })}>Redo</button>
        <button onClick={() => dispatch({ type: "clear" })}>Clear</button>
        <span className="hint">{state.penSeen ? "Pencil mode: your palm is ignored" : "Draw with a finger, mouse or Apple Pencil"}</span>
      </div>
      <svg ref={svg} className="paper" role="img" aria-label="Sketch"
        onPointerDown={e => { kindRef.current = kindOf(e); (e.target as Element).setPointerCapture?.(e.pointerId);
          dispatch({ type: "down", pointerId: e.pointerId, kind: kindOf(e), point: toPoint(e), tool, color, size }); }}
        onPointerMove={e => { const evs = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
          dispatch({ type: "move", pointerId: e.pointerId, kind: kindOf(e), points: evs.map(toPoint) }); }}
        onPointerUp={e => dispatch({ type: "up", pointerId: e.pointerId })}
        onPointerCancel={e => dispatch({ type: "up", pointerId: e.pointerId })}>
        {state.strokes.map((s, i) => <StrokePath key={i} s={s} kind={kindRef.current} />)}
        {state.current && <StrokePath s={state.current} kind={kindRef.current} />}
      </svg>
    </div>
  );
}
