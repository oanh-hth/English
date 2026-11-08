# Phase 3: React components

**Goal:** JSX, props, state, events, lists, forms and accessible markup, tested like a user would use them.

## Why this phase
Now the user can see and touch things. React builds the screen from **components**: functions that take **props** and return **JSX**.

## Learn
1. **Components and props.**
   ```tsx
   function TaskCard({ task, onOpen }: { task: Task; onOpen: (id: string) => void }) {
     return <button onClick={() => onOpen(task.id)}><h3>{task.title}</h3></button>;
   }
   ```
2. **Conditional rendering.** `{task.links.length > 0 && <span>{task.links.length} linked</span>}` (careful: `{0 && ...}` renders `0`, so compare with `> 0`).
3. **Lists and keys.** `tasks.map(t => <TaskCard key={t.id} task={t} />)`. Keys must be stable ids, not the array index.
4. **State.** `const [text, setText] = useState("")`. Setting state re-renders the component.
5. **Controlled inputs.** `<input value={text} onChange={e => setText(e.target.value)} />`. React owns the value.
6. **Forms.** Handle `onSubmit` on the `<form>` and call `e.preventDefault()`. Enter and the submit button both work.
7. **Refs.** `useRef<HTMLInputElement>(null)` gives you the DOM element, for example to call `.focus()`.
8. **Accessibility is also how tests find things.** Tests use `getByRole("button", { name: "Add" })` and `getByLabelText("Title")`, the same way a screen reader would. Use real `<button>`, `<label htmlFor>`, headings and `role="alert"` for errors.
9. **Lifting state up.** Components don't own the task list; they receive it and call `onMove`, `onRename`… The parent decides what happens.
10. **Effects for outside things.** `useEffect` to listen to the Escape key, with a cleanup that removes the listener.

Try your components in the **playground**: `npm run dev`, then open http://localhost:5173/#playground.

## Read
- Describing the UI: https://react.dev/learn/describing-the-ui
- Responding to events: https://react.dev/learn/responding-to-events
- State, a component's memory: https://react.dev/learn/state-a-components-memory
- Reacting to input with state: https://react.dev/learn/reacting-to-input-with-state
- Testing Library queries (priority): https://testing-library.com/docs/queries/about#priority

## Exercises
Do them in order; later exercises use earlier ones.

| # | Exercise | You edit |
|---|---|---|
| [3.1](3.1-task-card.md) | TaskCard component | `app/client/src/components/TaskCard.tsx` |
| [3.2](3.2-quick-capture.md) | QuickCapture form | `app/client/src/components/QuickCapture.tsx` |
| [3.3](3.3-board.md) | Board with columns and move buttons | `app/client/src/components/Board.tsx` |
| [3.4](3.4-task-drawer.md) | TaskDrawer: edit, link and complete | `app/client/src/components/TaskDrawer.tsx` |

Start with `npm run ex 3.1`. When an exercise passes, commit it and run `npm run progress`.

## Knowledge check
Tick each box (change `[ ]` to `[x]`) when you can explain it in your own words. `npm run progress` counts them.

- [ ] I can build a component from props and explain one-way data flow
- [ ] I use stable keys when rendering lists
- [ ] I can build a controlled form and handle submit with Enter and the button
- [ ] I find elements by role and label, and know why that also helps screen readers
- [ ] I can add and clean up a window event listener in an effect
- [ ] I can explain "lifting state up" with the Board and TaskDrawer as examples
