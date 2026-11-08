import { useRef, useState, type FormEvent } from "react";

export interface QuickCaptureProps {
  onAdd: (title: string) => void;
}

export function QuickCapture({ onAdd }: QuickCaptureProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const title = text.trim();
    if (!title) { setError("Type a task first"); return; }
    onAdd(title);
    setText(""); setError("");
    input.current?.focus();
  }

  return (
    <form className="capture" onSubmit={submit}>
      <label htmlFor="capture" className="visually-hidden">Capture a task</label>
      <input id="capture" ref={input} value={text} placeholder="Capture a task before you forget it…" autoComplete="off"
        onChange={e => { setText(e.target.value); if (error) setError(""); }} />
      <button type="submit">Add</button>
      {error && <p role="alert" className="error">{error}</p>}
    </form>
  );
}
