import type { Folder } from "@app/shared/folders";
import { FolderArt } from "@app/client/src/components/Art";

const decisionsText = (n: number) => `${n} ${n === 1 ? "decision" : "decisions"}`;

export function FolderShelf({ folders, onOpen }: { folders: Folder[]; onOpen: (category: string) => void }) {
  if (!folders.length) return <p className="empty">No decisions yet. Finished complex tasks are filed here, one folder per topic.</p>;
  return (
    <>
      {["Frontend", "Backend", "Workflow", "Other"].map(g => {
        const list = folders.filter(f => f.group === g);
        if (!list.length) return null;
        return (
          <section key={g} aria-label={g} className="shelf">
            <h2>{g}</h2>
            <div className="folders">
              {list.map(f => (
                <button key={f.category} type="button" className="folder" aria-label={`${f.name}, ${decisionsText(f.count)}`} onClick={() => onOpen(f.category)}>
                  <FolderArt group={f.group} stickers={f.stickers} />
                  <span className="folder-name">{f.name}</span>
                  <span className="folder-count">{decisionsText(f.count)} · latest {f.latest}</span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
