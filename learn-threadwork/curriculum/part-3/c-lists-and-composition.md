# Part 3c: Lists and composition

*[Part 3: React components](README.md) · section c*

The task list puts your rows together: what's to do on top, what's done below. In this section you learn **lists**, **keys** and **composition**.

## Rendering lists

```tsx
<ul>{todo.map(t => <TaskItem key={t.id} task={t} … />)}</ul>
```

Every item needs a **`key`** that identifies it among its siblings. Use the task id, never the array index. When a task moves from *To do* to *Done*, React uses keys to know which row is which.

## Composition and passing props through

The list doesn't know how a row looks; it uses `TaskItem`. It doesn't know what "complete" does either; it passes the handlers through:

```tsx
export function TaskList({ tasks, today, ...handlers }: TaskListProps) {
  // …
  <TaskItem key={t.id} task={t} today={today} {...handlers} />
}
```

`...handlers` collects the remaining props into one object, and `{...handlers}` spreads them onto the child. The type says exactly which ones: `Pick<TaskItemProps, "onComplete" | "onRecord" | "onReopen" | "onDelete">`. TypeScript then makes sure the list and the row agree.

## Sorting in one place

Use `sortTasks` from 1.4 and split the result. The order rule (due first, then age; newest done first) lives in one tested function, not in the component.

## Long lists

After a few weeks, *Done* gets long. Show the 10 most recent and a button "Show all 34". That's a little piece of local state, `showAll`, that only this component cares about. Not everything belongs in the app's state.

## Regions and empty states

Each half is a `<section aria-label="To do">`, a **region** with a name. Screen reader users can jump between them, and tests can look inside one with `within(...)`. An empty half says so ("Nothing to do. Capture a task above."): empty states tell people the app works and what to do next.

## Read more
- Rendering lists: <https://react.dev/learn/rendering-lists>
- Sharing state between components: <https://react.dev/learn/sharing-state-between-components>
- Region role (MDN): <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/region_role>

---

## Exercises 3.3

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 3.3: TaskList

**Edit:** `app/client/src/components/TaskList.tsx` · **Tests:** `tests/part-3/3.3-task-list.test.tsx` · **Run:** `npm run ex 3.3`

Build `TaskList`: *To do (N)* and *Done (N)* sections in `sortTasks` order, `TaskItem` rows with the handlers passed through, empty states, and *Show all N* for more than 10 done tasks.

---

[← 3b State and forms](b-state-and-forms.md) · [3d The outcome form →](d-the-outcome-form.md)
