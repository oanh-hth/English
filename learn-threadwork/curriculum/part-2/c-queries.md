# Part 2c: Queries: the decision log and the weekly summary

*[Part 2: The app's logic: dates, a reducer and queries](README.md) · section c*

The decision log and the weekly summary don't store anything new. They are **queries**: functions that look at the tasks and compute what the screen should show. In this section you write them.

## Derive, don't store

You could keep a separate list of decisions and update it whenever a task is finished, edited, reopened or deleted. That's four places to get wrong. Instead, compute it:

```ts
const decisions = decisionsOf(state.tasks);
```

A decision is simply a done task with an outcome. Rule of thumb: **store the minimum, derive the rest.**

## Chaining array methods

Most queries are a chain:

```ts
tasks
  .filter(t => t.status === "done" && t.outcome)
  .map(t => ({ taskId: t.id, title: t.title, doneAt: t.doneAt!, ...t.outcome! }))
  .sort((a, b) => /* newest first */);
```

Spreading `...t.outcome!` copies `result`, `decision` and `category` into the new object. The `!` tells TypeScript "I checked this isn't null".

## Filters that combine

The log can be filtered by group, by category and by text, in any combination. Write it so that a filter that isn't set lets everything through:

```ts
decisions.filter(d =>
  (!filter.group || categoryById(d.category)?.group === filter.group) &&
  (!filter.category || d.category === filter.category) &&
  (!q || [d.title, d.result, d.decision].some(s => s.toLowerCase().includes(q))));
```

Search is case-insensitive and ignores surrounding spaces. That's what people expect from a search box.

## Counting

```ts
const counts: Record<string, number> = {};
for (const d of decisions) counts[d.category] = (counts[d.category] ?? 0) + 1;
```

The filter menu shows these counts ("React (3)"), so you can see at a glance which topics you decide about most.

## The weekly summary

Above the task list sits a summary: to do, overdue, done today, done this week, decisions this week, and the topic you decided about most. Each is one small query. Keep them in one function so the page asks once. Ties need a rule, or the answer could flicker: the category that appears first in the task list wins. A `Map` keeps insertion order, which gives you that rule for free.

## Read more
- Choosing the state structure (avoid redundant state): <https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state>
- `Array.prototype.filter` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter>
- `Map` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map>

---

## Exercises 2.3–2.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 2.3: Decisions: list, filter and count

**Edit:** `app/shared/decisions.ts` · **Tests:** `tests/part-2/2.3-decisions.test.ts` · **Run:** `npm run ex 2.3`

Write `decisionsOf`, `filterDecisions` and `countByCategory` in `decisions.ts`.

### 2.4: The weekly summary

**Edit:** `app/shared/summary.ts` · **Tests:** `tests/part-2/2.4-summary.test.ts` · **Run:** `npm run ex 2.4`

Write `weekSummary(tasks, today)`. Use `startOfWeek` from 2.1. Break ties for the top category by the first one in the task list.

---

[← 2b A reducer for the whole app](b-reducers.md) · [Part 3: React components →](../part-3/README.md)
