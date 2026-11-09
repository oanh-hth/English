# Part 3c: Lists and composition

*[Part 3: React components](README.md) · section c*

The board shows your tasks in three columns: *Inbox*, *Doing* and *Done*. In this section you learn to render **lists** and to **compose** components: the board is made of the task cards you built in 3a.

## Rendering lists

Turn an array into elements with `map`:

```tsx
<ul>
  {tasks.map(t => <li key={t.id}>{t.title}</li>)}
</ul>
```

Every item needs a **`key`**: a value that identifies it among its siblings. React uses keys to know which item is which when the list changes. Use a stable id, never the array index: if you used the index and you then moved a task, React would mix up which card is which.

## Composition

The board doesn't know how a task card looks. It just uses the component:

```tsx
{list.map(t => <TaskCard key={t.id} task={t} today={today} onOpen={onOpen} />)}
```

The board passes `onOpen` straight through. This is **lifting state up**: the board doesn't decide what happens when a task moves. It calls `onMove(id, status)`, and whoever renders the board decides. In the app, that's the reducer in Part 4; in the playground, a little local state. One component, two very different uses.

## Landmarks

Each column is a `<section aria-label="Inbox">`. That makes it a **region** with a name. Screen reader users can jump between columns, and tests can look inside one column:

```tsx
const inbox = screen.getByRole("region", { name: "Inbox" });
within(inbox).getByRole("heading", { name: "Alpha" });
```

## Buttons instead of dragging

On a computer you might drag cards between columns. On an iPad, dragging with a finger conflicts with scrolling, and with the pencil it's fiddly. Small, clear buttons ("→ Doing") work for everyone, including keyboard and VoiceOver users. Give each one a full name for assistive technology:

```tsx
<button aria-label={`Move ${t.title} to Doing`} onClick={() => onMove(t.id, "doing")}>→ Doing</button>
```

## Empty states

An empty column should say so ("Nothing here") instead of showing nothing. Empty states tell people the app works, and that the column is ready for tasks.

## Read more
- Rendering lists: <https://react.dev/learn/rendering-lists>
- Sharing state between components: <https://react.dev/learn/sharing-state-between-components>
- ARIA landmarks (MDN): <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/region_role>

---

## Exercises 3.3

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 3.3: Board with columns and move buttons

**Edit:** `app/client/src/components/Board.tsx` · **Tests:** `tests/part-3/3.3-board.test.tsx` · **Run:** `npm run ex 3.3`

Build `Board`: three `<section aria-label="…">` columns in `COLUMNS` order, each with an `<h2>` like "Inbox (2)", a `TaskCard` per task, move buttons to the two other columns under each card, and "Nothing here" when empty.

---

[← 3b State and forms](b-state-and-forms.md) · [3d Effects and an editing panel →](d-effects-and-editing.md)
