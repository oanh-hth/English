import { decisionsToMarkdown } from "@app/shared/export";
import type { Decision } from "@app/shared/decisions";

const d = (taskId: string, category: string, title: string, doneAt: string, result = "R", decision = "D"): Decision => ({ taskId, title, doneAt, category, result, decision });

describe("5.4 decisionsToMarkdown", () => {
  it("groups by group and category, in list order", () => {
    const md = decisionsToMarkdown([
      d("1", "node", "Server storage", "2026-11-13", "Files are enough", "JSON files"),
      d("2", "react", "State", "2026-11-12", "One place for changes", "useReducer"),
      d("3", "css", "Spacing", "2026-11-11", "Gap is simpler", "Use gap"),
      d("4", "react", "Forms", "2026-11-10", "Fewer re-renders\nwith refs", "Controlled\ninputs anyway"),
    ]);
    expect(md).toBe([
      "# Decisions", "",
      "## Frontend", "",
      "### CSS", "",
      "- **Spacing** (2026-11-11)", "  - Result: Gap is simpler", "  - Decision: Use gap", "",
      "### React", "",
      "- **State** (2026-11-12)", "  - Result: One place for changes", "  - Decision: useReducer",
      "- **Forms** (2026-11-10)", "  - Result: Fewer re-renders with refs", "  - Decision: Controlled inputs anyway", "",
      "## Backend", "",
      "### Node.js", "",
      "- **Server storage** (2026-11-13)", "  - Result: Files are enough", "  - Decision: JSON files", "",
    ].join("\n"));
  });
  it("puts unknown categories last", () => {
    const md = decisionsToMarkdown([d("1", "mystery", "Old", "2026-01-01"), d("2", "git", "Branches", "2026-01-02")]);
    expect(md.indexOf("## Workflow")).toBeLessThan(md.indexOf("## Other"));
    expect(md).toContain("## Other\n\n### mystery\n\n- **Old** (2026-01-01)");
    expect(md.endsWith("Decision: D\n")).toBe(true);
  });
  it("says when there is nothing", () => expect(decisionsToMarkdown([])).toBe("# Decisions\n\nNo decisions yet.\n"));
});
