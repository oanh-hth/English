import { useRef, type KeyboardEvent } from "react";
import { THEMES } from "@app/client/src/art/art";
import { SceneThumb } from "@app/client/src/components/Art";

export function ThemePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, THEMES.findIndex(t => t.id === value));
  function onKey(e: KeyboardEvent) {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + THEMES.length) % THEMES.length;
    onChange(THEMES[next]!.id);
    buttons.current[next]?.focus();
  }
  return (
    <div role="radiogroup" aria-label="Background" className="theme-picks" onKeyDown={onKey}>
      {THEMES.map((t, i) => (
        <button key={t.id} ref={el => { buttons.current[i] = el; }} type="button" role="radio" aria-checked={t.id === value}
          tabIndex={i === index ? 0 : -1} className="theme-pick" onClick={() => onChange(t.id)}>
          <SceneThumb id={t.id} />
          <span>{t.name}</span>
        </button>
      ))}
    </div>
  );
}
