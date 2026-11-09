import type { Sketch, Task } from "@app/shared/types";

export interface SketchGalleryProps {
  sketches: Sketch[];
  tasks: Task[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SketchGallery({ sketches, tasks, onOpen, onDelete }: SketchGalleryProps) {
  if (sketches.length === 0) return <p className="muted">No sketches yet. Draw something and save it.</p>;
  const title = (id: string | null) => (id && tasks.find(t => t.id === id)?.title) || "No task";
  return (
    <ul aria-label="Saved sketches" className="gallery">
      {sketches.map(s => (
        <li key={s.id}>
          <button type="button" aria-label={s.title} onClick={() => onOpen(s.id)} className="thumb">
            <svg viewBox={`0 0 ${s.width} ${s.height}`} aria-hidden="true">
              {s.strokes.map((st, i) => <path key={i} d={st.d} stroke={st.color} strokeWidth={st.width} strokeOpacity={st.opacity} fill="none" strokeLinecap="round" />)}
            </svg>
            <span>{s.title}</span>
          </button>
          <small>{title(s.taskId)}</small>
          <button type="button" onClick={() => onDelete(s.id)}>Delete {s.title}</button>
        </li>
      ))}
    </ul>
  );
}
