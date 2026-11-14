# Part 5d: Exporting to Markdown

*[Part 5: The decision log](README.md) · section d*

Your decisions shouldn't be locked inside the app. In this section you export them as **Markdown**, plain text with a little formatting. You can paste it into notes, read it before an interview, or keep it in a git repository.

## Building text from data

Markdown is just lines:

```md
# Decisions

## Frontend

### React

- **Pick a state management approach** (2026-11-14)
  - Result: Context + useReducer covers everything.
  - Decision: No state library for now.
```

Build an array of lines, then `join("\n")`. It's easier to get blank lines right than with string concatenation.

## Grouping in a fixed order

Go through `GROUPS` in order, then the `CATEGORIES` of each group in list order, and keep only those with decisions. The export then always looks the same, whatever order you made decisions in, so two exports are easy to compare.

Decisions whose category isn't in the list anymore (you renamed or removed one) still deserve a place: put them last, under "Other".

## Details that make text clean

- A result typed with line breaks would break the list. Turn line breaks into spaces: `s.replace(/\s*\n\s*/g, " ")`.
- End the file with exactly one newline. Many tools expect it, and git shows a warning otherwise.

## Pure first, download second

`decisionsToMarkdown` is a pure function: decisions in, text out, perfectly testable. The *Export as Markdown* button (given) just passes the result to a small download helper. Keeping the "how to save a file" part separate means you could also copy the text to the clipboard or send it somewhere, without touching the formatting code.

## Read more
- Markdown guide: <https://www.markdownguide.org/basic-syntax/>
- Regular expressions (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions>

---

## Exercises 5.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 5.4: Export decisions as Markdown

**Edit:** `app/shared/export.ts` · **Tests:** `tests/part-5/5.4-export.test.ts` · **Run:** `npm run ex 5.4`

Write `decisionsToMarkdown(decisions)` in the exact format of the starter comment: groups and categories in list order, unknown categories under "Other", line breaks flattened, one final newline. Then press *Export as Markdown* on the Decisions page.

---

[← 5c Putting the log together](c-the-decision-log.md) · [Part 6: A Node.js server →](../part-6/README.md)
