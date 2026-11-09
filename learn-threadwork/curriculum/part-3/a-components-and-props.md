# Part 3a: Components and props

*[Part 3: React components](README.md) · section a*

React builds a user interface out of **components**: functions that take data and return what to show. In this section you build Threadwork's task card, the small box you'll see for every task on the board and on the Today page.

## A first component

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

// used like an HTML tag:
<Greeting name="Oanh" />
```

The HTML-like syntax is **JSX**. It becomes ordinary function calls, so you can put any JavaScript expression in `{ }`. Component names start with a capital letter; that's how React tells them apart from HTML tags.

The values a component receives are its **props**. Props flow in one direction: from parent to child. A component never changes its props.

## Props with TypeScript

Describe the props with an interface, then destructure them:

```tsx
interface TaskCardProps {
  task: Task;
  today: string;
  onOpen: (id: string) => void;
}

export function TaskCard({ task, today, onOpen }: TaskCardProps) {
  return (
    <button type="button" onClick={() => onOpen(task.id)}>
      <h3>{task.title}</h3>
    </button>
  );
}
```

`onOpen` is a function the parent gives you. The card doesn't know what "open" means: on the board it opens the drawer, and in the playground it just logs. Components that receive callbacks are easy to reuse and easy to test.

## Showing something only sometimes

```tsx
{due && <span>{due}</span>}
{task.links.length > 0 && <span>{task.links.length} linked</span>}
```

`&&` renders the right side when the left is truthy. Careful with numbers: `{task.links.length && …}` renders a **`0`** on the screen when there are no links, because React shows numbers. Compare with `> 0` instead.

For "this or that", use the ternary `cond ? <A /> : <B />`.

## Classes and attributes

In JSX, `class` is written `className`. Attributes can be expressions:

```tsx
<span className={`pill ${task.importance}`}>High</span>
<button data-status={task.status}>…</button>
```

`data-*` attributes are a handy way to expose state to CSS (`[data-status="done"] h3 { text-decoration: line-through }`) and to tests.

## Testing components the way people use them

Component tests use **Testing Library**. It renders your component into a fake page, and you find elements by their **role** and **name**, the way a screen reader does:

```tsx
render(<TaskCard task={t} today="2026-11-08" onOpen={onOpen} />);
await userEvent.click(screen.getByRole("button", { name: /write brief/i }));
expect(onOpen).toHaveBeenCalledWith("a");
```

So real HTML matters: a `<button>` has the role "button", an `<h3>` is a "heading". If your test can't find something, a person using VoiceOver on the iPad probably can't either.

## Read more
- Your first component: <https://react.dev/learn/your-first-component>
- Passing props: <https://react.dev/learn/passing-props-to-a-component>
- Conditional rendering: <https://react.dev/learn/conditional-rendering>
- Testing Library queries: <https://testing-library.com/docs/queries/about#priority>

---

## Exercises 3.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 3.1: TaskCard

**Edit:** `app/client/src/components/TaskCard.tsx` · **Tests:** `tests/part-3/3.1-task-card.test.tsx` · **Run:** `npm run ex 3.1`

Build `TaskCard`: a `<button type="button">` with `data-status`, the title in an `<h3>`, the importance pill, the due label from `dueLabel()` (given in `format.ts`), and "N linked" / "N resources" ("1 resource" for one) only when there are any. Clicking calls `onOpen(task.id)`.

Check it in the playground: `npm run dev`, then open <http://localhost:5173/#playground>.

---

[← Part 3 overview](README.md) · [3b State and forms →](b-state-and-forms.md)
