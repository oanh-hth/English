// Exercise 5.4: Export decisions as Markdown. Read curriculum/part-5/d-export.md first.
import type { Decision } from "@app/shared/decisions";

/**
 * Format (decisions are already filtered and sorted newest first; keep that order inside a category):
 *
 *   # Decisions
 *   <empty line>
 *   ## <Group>                      groups in GROUPS order, only groups that have decisions
 *   <empty line>
 *   ### <Category name>             categories in CATEGORIES order, only ones that have decisions
 *   <empty line>
 *   - **<title>** (<doneAt>)
 *     - Result: <result>            line breaks inside result/decision become spaces
 *     - Decision: <decision>
 *   <empty line after each category's list>
 *
 * Unknown category ids go last, under "## Other" and "### <id>". No decisions: "# Decisions\n\nNo decisions yet.\n".
 * The text ends with exactly one "\n".
 */
export function decisionsToMarkdown(decisions: readonly Decision[]): string {
  // TODO 5.4
  throw new Error("TODO 5.4");
}
