// Exercise 5.5: ResourceLibrary page. Read curriculum/part-5/c-resources.md first.
import type { Resource, ResourceKind, Task } from "@app/shared/types";
import type { Usage } from "@app/shared/resources";
import { Todo } from "@app/client/src/components/Todo";

export const KINDS: ResourceKind[] = ["link", "file", "tool", "book", "person"];

export interface ResourceLibraryProps {
  resources: Resource[];
  tasks: Task[];
  usage: Record<string, Usage>;
  onAdd: (name: string, kind: ResourceKind, url: string) => void;
  onRemove: (id: string) => void;
  onOpenTask: (id: string) => void;
}

/**
 * - A form: input "Name", select "Kind" (KINDS, default "link"), input "Link" (optional), button "Add resource".
 *   Empty name: show "Give the resource a name" (role="alert"), don't call onAdd. After adding, clear the inputs.
 * - A <table> with a row per resource: name, kind, "Used in N of M tasks" (usedIn of taskIds.length), a button per
 *   attached task (the task title) calling onOpenTask, and a button "Delete <name>" calling onRemove.
 * - With no resources: "No resources yet. Add the files, links, tools, books and people you work with."
 */
export function ResourceLibrary(props: ResourceLibraryProps) {
  // TODO 5.5
  return <Todo exercise="5.5" what="The resource library" />;
}
