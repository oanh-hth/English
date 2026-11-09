// Given: a drawing surface built on your Part 6 code (geometry, sketchReducer, strokeToSaved).
import { useReducer, useRef, useState, type PointerEvent } from "react";
import type { SavedStroke } from "@app/shared/types";
import { sketchReducer, emptySketch, type Tool, type Stroke } from "@app/client/src/sketch/sketchReducer";
import { type Point, type PointerKind } from "@app/client/src/sketch/geometry";
import { strokeToSaved } from "@app/client/src/sketch/save";

const COLORS = ["#1D2227", "#2F45C2", "#C2412F", "#2C8A57", "#E2A21A"];

function Live({ s, kind }: { s: Stroke; kind: PointerKind }) {
  let saved: SavedStroke;
  try { saved = strokeToSaved(s, kind); } catch { return null; }
  return <path d={saved.d} fill="none" strokeLinecap="round" strokeLinejoin="round" stroke={saved.color} strokeOpacity={saved.opacity} strokeWidth={saved.width} />;
}

export function SketchPad({ initial = [], onSave }: { initial?: SavedStroke[]; onSave: (strokes: SavedStroke[], width: number, height: number) => void }) {
  const [state, dispatch] = useReducer(sketchReducer, emptySketch);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]!);
  const [size, setSize] = useState(4);
  const kind = useRef<PointerKind>("mouse");
  const svg = useRef<SVGSVGElement>(null);

  const toPoint = (e: { clientX: number; clientY: number; pressure: number }): Point => {
    const r = svg.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, pressure: e.pressure || 0.5 };
  };
  const kindOf = (e: PointerEvent) => (e.pointerType === "pen" || e.pointerType === "touch" ? e.pointerType : "mouse") as PointerKind;
  const save = () => {
    const r = svg.current!.getBoundingClientRect();
    onSave([...initial, ...state.strokes.map(s => strokeToSaved(s, kind.current))], Math.round(r.width), Math.round(r.height));
    dispatch({ type: "clear" });
  };

  return (
    <div className="sketch">
      <div className="toolbar" role="toolbar" aria-label="Drawing tools">
        {(["pen", "marker", "eraser"] as Tool[]).map(t => <button key={t} aria-pressed={tool === t} onClick={() => setTool(t)}>{t}</button>)}
        {COLORS.map(c => <button key={c} aria-label={`Colour ${c}`} aria-pressed={color === c} className="swatch" style={{ background: c }} onClick={() => setColor(c)} />)}
        <label>Size <input type="range" min={1} max={20} value={size} onChange={e => setSize(+e.target.value)} /></label>
        <button onClick={() => dispatch({ type: "undo" })}>Undo</button>
        <button onClick={() => dispatch({ type: "redo" })}>Redo</button>
        <button onClick={() => dispatch({ type: "clear" })}>Clear</button>
        <button className="primary" onClick={save}>Save sketch</button>
        <span className="hint">{state.penSeen ? "Pencil mode: your palm is ignored" : "Draw with a finger, mouse or Apple Pencil"}</span>
      </div>
      <svg ref={svg} className="paper" role="img" aria-label="Sketch"
        onPointerDown={e => { kind.current = kindOf(e); (e.target as Element).setPointerCapture?.(e.pointerId);
          dispatch({ type: "down", pointerId: e.pointerId, kind: kindOf(e), point: toPoint(e), tool, color, size }); }}
        onPointerMove={e => { const evs = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
          dispatch({ type: "move", pointerId: e.pointerId, kind: kindOf(e), points: evs.map(toPoint) }); }}
        onPointerUp={e => dispatch({ type: "up", pointerId: e.pointerId })}
        onPointerCancel={e => dispatch({ type: "up", pointerId: e.pointerId })}>
        {initial.map((s, i) => <path key={`i${i}`} d={s.d} fill="none" strokeLinecap="round" stroke={s.color} strokeOpacity={s.opacity} strokeWidth={s.width} />)}
        {state.strokes.map((s, i) => <Live key={i} s={s} kind={kind.current} />)}
        {state.current && <Live s={state.current} kind={kind.current} />}
      </svg>
    </div>
  );
}
