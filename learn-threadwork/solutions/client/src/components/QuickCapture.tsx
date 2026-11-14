import { useRef, useState, type FormEvent } from "react";
import type { Complexity, Day } from "@app/shared/types";

export interface QuickCaptureProps {
  onAdd: (title: string, complexity: Complexity, due: Day | null) => void;
}

export function QuickCapture({ onAdd }: QuickCaptureProps) {
  const [text, setText] = useState("");
  const [complex, setComplex] = useState(false);
  const [due, setDue] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const title = text.trim();
    if (!title) { setError("Type a task first"); return; }
    onAdd(title, complex ? "complex" : "simple", due || null);
    setText(""); setComplex(false); setDue(""); setError("");
    input.current?.focus();
  }

  return (
    <form className="capture" onSubmit={submit}>
      <label htmlFor="capture" className="visually-hidden">Capture a task</label>
      <input id="capture" ref={input} value={text} placeholder="What do you need to do?" autoComplete="off"
        onChange={e => { setText(e.target.value); if (error) setError(""); }} />
      <label className="check"><input type="checkbox" checked={complex} onChange={e => setComplex(e.target.checked)} /> Needs a decision</label>
      <label className="date">Due <input type="date" value={due} onChange={e => setDue(e.target.value)} /></label>
      <button type="submit" className="primary">Add</button>
      {error && <p role="alert" className="error">{error}</p>}
    </form>
  );
}
