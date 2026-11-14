# Part 3a: Components and props

*[Part 3: React components](README.md) · section a*

React builds a user interface from **components**: functions that take data and return what to show. In this section you build one row of the task list, which looks different for a simple task, a complex task, and a finished one.

## A first component

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}
<Greeting name="Oanh" />
```

The HTML-like syntax is **JSX**. Put any JavaScript expression in `{ }`. The values a component receives are its **props**; they flow from parent to child, and a component never changes them.

## Props with TypeScript, and callbacks

```tsx
interface TaskItemProps {
  task: Task;
  today: string;
  onComplete: (id: string) => void;
  onRecord: (id: string) => void;
}

export function TaskItem({ task, onComplete, onRecord }: TaskItemProps) { … }
```

The row doesn't know what "complete" does. It calls `onComplete(task.id)` and the parent decides: in the app, the reducer; in the playground, a little local state. Components that receive callbacks are easy to reuse and easy to test.

## One component, several looks

```tsx
{task.status === "todo" && task.complexity === "simple" && (
  <input type="checkbox" aria-label={`Done: ${task.title}`} onChange={() => onComplete(task.id)} />
)}
{task.status === "todo" && task.complexity === "complex" && (
  <button aria-label={`Record result for ${task.title}`} onClick={() => onRecord(task.id)}>Record result</button>
)}
```

`&&` renders the right side only when the left is true. For "this or that", use `cond ? <A /> : <B />`. Careful with numbers: `{count && …}` shows a `0` on screen, so compare with `> 0`.

The design choice matters here: a simple task gets a checkbox, the fastest possible action. A complex task gets a button, because finishing it means writing something down.

## Showing data from elsewhere

A finished complex task shows its category's **name**, not its id. Use `categoryById` from 1.2. Show the due label from `dueLabel` (2.1) only while the task is still to do.

## Attributes for CSS and tests

```tsx
<li data-status={task.status} data-complexity={task.complexity}>
```

`data-*` attributes expose state to CSS (`[data-status="done"] .title { color: gray }`) without extra class logic.

## Accessible names

Every row has "Delete", so screen readers (and tests) need to know *which* one. `aria-label="Delete Fix the header"` gives each button a full name while the screen still shows the short word.

## Testing like a person

Tests use **Testing Library**: render, then find elements by **role** and **name**, the way a screen reader does:

```tsx
render(<ul><TaskItem task={t} … /></ul>);
await userEvent.click(screen.getByRole("checkbox", { name: "Done: Fix the header" }));
expect(onComplete).toHaveBeenCalledWith("a");
```

If a test can't find something, a person using VoiceOver on the iPad probably can't either.

## Read more
- Your first component: <https://react.dev/learn/your-first-component>
- Passing props: <https://react.dev/learn/passing-props-to-a-component>
- Conditional rendering: <https://react.dev/learn/conditional-rendering>
- Testing Library queries: <https://testing-library.com/docs/queries/about#priority>

---

## Exercises 3.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 3.1: TaskItem

**Edit:** `app/client/src/components/TaskItem.tsx` · **Tests:** `tests/part-3/3.1-task-item.test.tsx` · **Run:** `npm run ex 3.1`

Build `TaskItem`: the title, a "Complex" pill, the due label, a checkbox (simple, to do), a *Record result* button (complex, to do), "Done …" with category name and decision (done), *Edit result* and *Reopen*, and *Delete*. The accessible names are listed in the starter comment.

---

[← Part 3 overview](README.md) · [3b State and forms →](b-state-and-forms.md)
