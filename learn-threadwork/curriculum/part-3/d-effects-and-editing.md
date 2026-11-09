# Part 3d: Effects and an editing panel

*[Part 3: React components](README.md) · section d*

Tapping a task opens the **drawer**, a panel where you rename the task, set its importance, link it to others and complete it. It's the most complex component so far, and it needs **effects**.

## Local state that follows a prop

The title input should edit freely, but only save when you're done typing. Keep a local copy in state:

```tsx
const [title, setTitle] = useState(task.title);
```

Problem: when you open a *different* task, `task` changes but `title` still holds the old one. State is only initialised on the first render. Re-sync it when the task changes:

```tsx
useEffect(() => setTitle(task.title), [task.id, task.title]);
```

## `useEffect`

An **effect** runs after React has updated the screen. Use it to synchronise with things outside React: browser events, timers, the network. The array is the list of **dependencies**: the effect runs again when one of them changes.

The drawer closes with the Escape key. Key presses happen on the `window`, which is outside React, so you listen in an effect, and **clean up** when the drawer closes:

```tsx
useEffect(() => {
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);   // cleanup
}, [onClose]);
```

Forgetting the cleanup is a classic bug: open and close the drawer ten times and ten listeners would still be running.

## Saving on blur and Enter

```tsx
<input value={title} onChange={e => setTitle(e.target.value)} onBlur={commit}
       onKeyDown={e => { if (e.key === "Enter") commit(); }} />
```

`commit` decides: if the trimmed title is empty, put the old one back; if it changed, call `onRename`. Don't call it when nothing changed.

## Selects

A `<select>` is controlled like an input. For "link to another task", the select acts as a menu, not a value: it always shows "Choose a task…", and choosing an option calls `onLink`. Setting `value=""` on the select does that.

Build option lists from data. For importance, combine `IMPORTANCE` and `GROWTH` from Part 1 so the menu reads "High · +25%". The menu teaches the reward rule while you use it.

## Slots: `children`

Part 5 adds attachments (resources, notes, sketches) to the drawer. Rather than changing the drawer then, it accepts **`children`** now: whatever the parent puts between `<TaskDrawer>` and `</TaskDrawer>`. Render `{children}` at the end.

## Read more
- Synchronizing with effects: <https://react.dev/learn/synchronizing-with-effects>
- You might not need an effect: <https://react.dev/learn/you-might-not-need-an-effect>
- Passing JSX as children: <https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children>

---

## Exercises 3.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 3.4: TaskDrawer: edit, link and complete

**Edit:** `app/client/src/components/TaskDrawer.tsx` · **Tests:** `tests/part-3/3.4-task-drawer.test.tsx` · **Run:** `npm run ex 3.4`

Build `TaskDrawer`, a `role="dialog"` named "Task details", with: *Close* (and Escape); a *Title* input that renames on blur or Enter; an *Importance* select with growth labels; the linked tasks with *Unlink* buttons; a *Link to another task* select; and *Complete · +N% growth*, or "Finished on …" when the task is done. Render `children` at the end.

---

[← 3c Lists and composition](c-lists-and-composition.md) · [Part 4: State management and hooks →](../part-4/README.md)
