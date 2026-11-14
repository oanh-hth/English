// Exercise 8.6: FolderShelf. Read curriculum/part-8/c-folders.md first.
import type { Folder } from "@app/shared/folders";
import { Todo } from "@app/client/src/components/Todo";

/**
 * For each group, in the order "Frontend", "Backend", "Workflow", "Other", that has folders:
 * <section aria-label={group}> with <h2>{group}</h2> and one button per folder:
 * - aria-label "<name>, <n> decisions" ("1 decision")
 * - inside: <FolderArt group stickers /> (given, in Art.tsx), the name, and "<n> decisions · latest <latest>"
 * - click: onOpen(folder.category)
 * No folders: <p>No decisions yet. Finished complex tasks are filed here, one folder per topic.</p>
 */
export function FolderShelf({ folders, onOpen }: { folders: Folder[]; onOpen: (category: string) => void }) {
  // TODO 8.6
  return <Todo exercise="8.6" what="The folder shelf" />;
}
