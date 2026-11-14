import type { CSSProperties } from "react";
import type { Folder } from "@app/shared/folders";
import { GROUP_COLORS } from "@app/client/src/art/art";
import { Sticker } from "@app/client/src/components/Stickers";

const TILTS = [-1.2, 0.8, -0.4, 1.1];

export function FolderView({ folder, onBack, onEdit }: { folder: Folder; onBack: () => void; onEdit: (taskId: string) => void }) {
  const n = folder.count;
  return (
    <section aria-label={`${folder.name} folder`} className="folder-open" style={{ "--folder": GROUP_COLORS[folder.group] ?? "#8A93A6" } as CSSProperties}>
      <div className="row">
        <button type="button" aria-label="All folders" onClick={onBack}>← All folders</button>
        <h2>{folder.name}</h2>
        <span className="muted">{n} {n === 1 ? "decision" : "decisions"}</span>
      </div>
      <div className="notes">
        {folder.decisions.map((d, i) => (
          <article key={d.taskId} className="note" aria-labelledby={`note-${d.taskId}`} style={{ "--tilt": `${TILTS[i % 4]}deg` } as CSSProperties}>
            <span className="clip" aria-hidden="true" />
            {d.sticker && <Sticker id={d.sticker} />}
            <header><h3 id={`note-${d.taskId}`}>{d.title}</h3><time dateTime={d.doneAt}>{d.doneAt}</time></header>
            <dl><dt>Result</dt><dd>{d.result}</dd><dt>Decision</dt><dd>{d.decision}</dd></dl>
            <button type="button" aria-label={`Edit ${d.title}`} onClick={() => onEdit(d.taskId)}>Edit</button>
          </article>
        ))}
      </div>
    </section>
  );
}
