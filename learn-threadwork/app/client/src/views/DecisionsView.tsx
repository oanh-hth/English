// Given: the Decisions page: folders (8.5, 8.6, 8.7) or the list (5.3), and the Markdown export (5.4).
import { useMemo, useState } from "react";
import { useApp } from "@app/client/src/state/AppContext";
import { DecisionLog } from "@app/client/src/components/DecisionLog";
import { FolderShelf } from "@app/client/src/components/FolderShelf";
import { FolderView } from "@app/client/src/components/FolderView";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { decisionsOf } from "@app/shared/decisions";
import { foldersOf } from "@app/shared/folders";
import { decisionsToMarkdown } from "@app/shared/export";
import { download, todayKey } from "@app/client/src/views/shared";

export function DecisionsView({ onEdit }: { onEdit: (taskId: string) => void }) {
  const { state } = useApp();
  const [mode, setMode] = useState<"folders" | "list">("folders");
  const [open, setOpen] = useState<string | null>(null);
  const folders = useMemo(() => { try { return foldersOf(decisionsOf(state.tasks)); } catch { return null; } }, [state.tasks]);
  const folder = open && folders?.find(f => f.category === open);
  return (
    <section className="card">
      <div className="row between">
        <h1>Decisions</h1>
        <ErrorBoundary area="Export">
          <button onClick={() => download(`decisions-${todayKey()}.md`, decisionsToMarkdown(decisionsOf(state.tasks)), "text/markdown")}>Export as Markdown</button>
        </ErrorBoundary>
      </div>
      <p className="muted">What you learned and decided while finishing complex tasks, filed by web development topic.</p>
      <div className="seg" role="group" aria-label="View">
        <button aria-pressed={mode === "folders"} onClick={() => { setMode("folders"); setOpen(null); }}>Folders</button>
        <button aria-pressed={mode === "list"} onClick={() => setMode("list")}>List</button>
      </div>
      {mode === "list"
        ? <ErrorBoundary area="The decision log"><DecisionLog tasks={state.tasks} onEdit={onEdit} /></ErrorBoundary>
        : folders === null
          ? <ErrorBoundary area="Folders"><FolderShelf folders={foldersOf(decisionsOf(state.tasks))} onOpen={setOpen} /></ErrorBoundary>
          : folder
            ? <ErrorBoundary area="The open folder"><FolderView folder={folder} onBack={() => setOpen(null)} onEdit={onEdit} /></ErrorBoundary>
            : <ErrorBoundary area="The folder shelf"><FolderShelf folders={folders} onOpen={setOpen} /></ErrorBoundary>}
    </section>
  );
}
