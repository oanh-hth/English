// Exercise 8.7: FolderView: paper notes. Read curriculum/part-8/c-folders.md first.
import type { Folder } from "@app/shared/folders";
import { Todo } from "@app/client/src/components/Todo";

/**
 * <section aria-label="<name> folder">:
 * - a button "← All folders" (aria-label "All folders") calling onBack, an <h2> with the name, and "<n> decisions"
 * - one <article className="note"> per decision, named by its <h3> title (aria-labelledby + useId, or an id from taskId),
 *   with a <time dateTime>, the sticker (<Sticker id> from 8.4) when there is one, Result and Decision in a <dl>,
 *   and a button "Edit" (aria-label "Edit <title>") calling onEdit(taskId)
 * - give each note a small tilt with a CSS variable: style={{ "--tilt": `${[-1.2, 0.8, -0.4, 1.1][i % 4]}deg` }}
 */
export function FolderView({ folder, onBack, onEdit }: { folder: Folder; onBack: () => void; onEdit: (taskId: string) => void }) {
  // TODO 8.7
  return <Todo exercise="8.7" what="An open folder" />;
}
