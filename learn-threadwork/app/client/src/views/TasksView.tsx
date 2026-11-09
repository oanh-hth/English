// Given: the Tasks page. Uses Board (3.3), TaskDrawer (3.4) and TaskAttachments (5.4).
import { useEffect, useState } from "react";
import { useApp } from "@app/client/src/state/AppContext";
import { Board } from "@app/client/src/components/Board";
import { TaskDrawer } from "@app/client/src/components/TaskDrawer";
import { TaskAttachments } from "@app/client/src/components/TaskAttachments";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { sketchesFor } from "@app/shared/sketches";
import { todayKey } from "@app/client/src/format";
import { newId, useShell } from "@app/client/src/views/shared";

export function TasksView() {
  const { state, dispatch } = useApp();
  const { go, selected } = useShell();
  const [openId, setOpenId] = useState<string | null>(selected.taskId ?? null);
  useEffect(() => { if (selected.taskId) setOpenId(selected.taskId); }, [selected.taskId]);
  const today = todayKey();
  const open = state.tasks.find(t => t.id === openId) ?? null;

  return (
    <>
      <ErrorBoundary area="The board">
        <Board tasks={state.tasks} today={today} onOpen={setOpenId} onMove={(id, s) => dispatch({ type: "move", id, status: s, today })} />
      </ErrorBoundary>
      {open && (
        <ErrorBoundary area="Task details">
          <TaskDrawer task={open} allTasks={state.tasks} onClose={() => setOpenId(null)}
            onRename={(id, title) => dispatch({ type: "rename", id, title })}
            onSetImportance={(id, importance) => dispatch({ type: "setImportance", id, importance })}
            onLink={(id, other) => dispatch({ type: "link", a: id, b: other })}
            onUnlink={(id, other) => dispatch({ type: "unlink", a: id, b: other })}
            onComplete={id => dispatch({ type: "move", id, status: "done", today })}>
            <ErrorBoundary area="Attachments">
              <TaskAttachments task={open} resources={state.resources}
                notes={state.notes.filter(n => n.taskId === open.id)} sketches={sketchesFor(state, open.id)}
                onAttach={rid => dispatch({ type: "attachResource", taskId: open.id, resourceId: rid })}
                onDetach={rid => dispatch({ type: "detachResource", taskId: open.id, resourceId: rid })}
                onMarkUsed={(rid, used) => dispatch({ type: "markResourceUsed", taskId: open.id, resourceId: rid, used })}
                onOpenNote={id => go("notes", { noteId: id })}
                onOpenSketch={id => go("sketch", { sketchId: id })}
                onNewNote={kind => { const id = newId(); dispatch({ type: "addNote", id, kind, taskId: open.id, now: Date.now() }); go("notes", { noteId: id }); }} />
            </ErrorBoundary>
            <button className="link danger" onClick={() => { dispatch({ type: "delete", id: open.id }); setOpenId(null); }}>Delete task</button>
          </TaskDrawer>
        </ErrorBoundary>
      )}
    </>
  );
}
