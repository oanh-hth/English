import type { Decision } from "@app/shared/decisions";
import { CATEGORIES, GROUPS } from "@app/shared/categories";

const oneLine = (s: string) => s.replace(/\s*\n\s*/g, " ").trim();

export function decisionsToMarkdown(decisions: readonly Decision[]): string {
  if (decisions.length === 0) return "# Decisions\n\nNo decisions yet.\n";
  const lines = ["# Decisions", ""];
  const known = new Set<string>(CATEGORIES.map(c => c.id));
  const block = (heading: string, list: readonly Decision[]) => {
    lines.push(`### ${heading}`, "");
    for (const d of list) lines.push(`- **${d.title}** (${d.doneAt})`, `  - Result: ${oneLine(d.result)}`, `  - Decision: ${oneLine(d.decision)}`);
    lines.push("");
  };
  for (const g of GROUPS) {
    const cats = CATEGORIES.filter(c => c.group === g && decisions.some(d => d.category === c.id));
    if (!cats.length) continue;
    lines.push(`## ${g}`, "");
    for (const c of cats) block(c.name, decisions.filter(d => d.category === c.id));
  }
  const other = [...new Set(decisions.filter(d => !known.has(d.category)).map(d => d.category))];
  if (other.length) {
    lines.push("## Other", "");
    for (const id of other) block(id, decisions.filter(d => d.category === id));
  }
  return lines.join("\n").replace(/\n+$/, "") + "\n";
}
