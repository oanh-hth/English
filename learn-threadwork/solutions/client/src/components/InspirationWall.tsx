import { useState, type FormEvent } from "react";
import type { Pin, Task } from "@app/shared/types";

export interface InspirationWallProps {
  pins: Pin[];
  wins: Task[];
  onAddQuote: (text: string, author: string) => void;
  onAddGoal: (text: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, by: -1 | 1) => void;
}

export function InspirationWall({ pins, wins, onAddQuote, onAddGoal, onRemove, onMove }: InspirationWallProps) {
  const [quote, setQuote] = useState(""), [author, setAuthor] = useState(""), [goal, setGoal] = useState("");
  const addQuote = (e: FormEvent) => { e.preventDefault(); if (!quote.trim()) return; onAddQuote(quote, author); setQuote(""); setAuthor(""); };
  const addGoal = (e: FormEvent) => { e.preventDefault(); if (!goal.trim()) return; onAddGoal(goal); setGoal(""); };
  return (
    <div className="wall">
      <form aria-label="Pin a quote" onSubmit={addQuote} className="row">
        <label htmlFor="q-text">Quote</label><input id="q-text" value={quote} onChange={e => setQuote(e.target.value)} />
        <label htmlFor="q-who">Who said it</label><input id="q-who" value={author} onChange={e => setAuthor(e.target.value)} />
        <button type="submit">Pin quote</button>
      </form>
      <form aria-label="Pin a goal" onSubmit={addGoal} className="row">
        <label htmlFor="g-text">Goal</label><input id="g-text" value={goal} onChange={e => setGoal(e.target.value)} />
        <button type="submit">Pin goal</button>
      </form>
      <ul aria-label="Pins" className="pins">
        {pins.map((p, i) => (
          <li key={p.id} className={`pin pin-${p.type}`}>
            {p.type === "quote"
              ? <blockquote>{p.text}{p.author && <cite>{p.author}</cite>}</blockquote>
              : <p>Goal: {p.text}</p>}
            <div className="row">
              <button type="button" disabled={i === 0} onClick={() => onMove(p.id, -1)}>Move up</button>
              <button type="button" disabled={i === pins.length - 1} onClick={() => onMove(p.id, 1)}>Move down</button>
              <button type="button" onClick={() => onRemove(p.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <h3>Wins</h3>
      {wins.length === 0
        ? <p className="muted">Finish a task to pin your first win.</p>
        : <ul aria-label="Wins" className="wins">{wins.slice(0, 12).map(t => <li key={t.id}>{t.title}</li>)}</ul>}
    </div>
  );
}
