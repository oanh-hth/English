import type { Day } from "@app/shared/types";
import type { Decision } from "@app/shared/decisions";
import { CATEGORIES, categoryById } from "@app/shared/categories";

export interface Folder { category: string; name: string; group: string; count: number; latest: Day; stickers: string[]; decisions: Decision[] }

export function foldersOf(decisions: readonly Decision[]): Folder[] {
  const unknown = [...new Set(decisions.map(d => d.category).filter(id => !categoryById(id)))];
  const ids = [...CATEGORIES.map(c => c.id as string), ...unknown];
  const out: Folder[] = [];
  for (const id of ids) {
    const list = decisions.filter(d => d.category === id);
    if (!list.length) continue;
    const c = categoryById(id);
    out.push({ category: id, name: c?.name ?? id, group: c?.group ?? "Other", count: list.length, latest: list[0]!.doneAt,
      stickers: [...new Set(list.map(d => d.sticker).filter((s): s is string => !!s))].slice(0, 3), decisions: [...list] });
  }
  return out;
}
