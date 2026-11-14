# Part 5c: Putting the log together

*[Part 5: The decision log](README.md) · section c*

Now the pieces come together: your queries from 2.3, the debounce hook from 4.4, the filters and the cards. This section is about **composing** a page from parts you trust.

## Where state lives

The log keeps one piece of state, the filter. Everything else is computed from props:

```tsx
const [filter, setFilter] = useState<FilterValue>(NONE);
const text = useDebouncedValue(filter.text, 250);
const all = useMemo(() => decisionsOf(tasks), [tasks]);
const counts = useMemo(() => countByCategory(all), [all]);
const shown = filterDecisions(all, { group: filter.group, category: filter.category, text });
```

The search input shows `filter.text` at once, so typing feels instant, while the list uses the debounced `text`.

## `useMemo`

`useMemo(fn, deps)` remembers a computed value until a dependency changes. Here it keeps the decisions and counts from being recomputed on every keystroke. Use it for real work on bigger data, not by reflex: most computations are cheap enough without it.

## Two kinds of empty

- **No decisions at all**: explain what the page is for and how decisions get here.
- **Decisions exist, but none match**: say so, and offer *Clear filters*.

These need different words, because people need different next steps.

## Cross-component actions

Clicking a card's category sets the filter to that category. The card reports `onCategory(id)`; the log turns it into a new filter. *Edit* goes further up: the log calls `onEdit(taskId)`, and the app shell switches to the Tasks page and opens the outcome form. Each component only knows its own job.

## Read more
- `useMemo`: <https://react.dev/reference/react/useMemo>
- Thinking in React: <https://react.dev/learn/thinking-in-react>

---

## Exercises 5.3

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 5.3: DecisionLog

**Edit:** `app/client/src/components/DecisionLog.tsx` · **Tests:** `tests/part-5/5.3-decision-log.test.tsx` · **Run:** `npm run ex 5.3`

Build `DecisionLog`: filter state, debounced search, `decisionsOf` / `countByCategory` / `filterDecisions`, `DecisionFilters`, a count, `DecisionCard`s (clicking a category filters by it), and both empty states. Then open the Decisions page.

---

[← 5b Decision cards](b-decision-cards.md) · [5d Exporting to Markdown →](d-export.md)
