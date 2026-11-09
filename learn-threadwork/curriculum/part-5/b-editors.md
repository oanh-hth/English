# Part 5b: Editors for notes, drafts and tables

*[Part 5: Linked work: notes, resources and the link map](README.md) · section b*

One editor serves three kinds of writing: a short **note** ("call the bank before Friday"), a long **draft**, and a **table** for rough numbers. In this section you build it, and practise rendering different UI from the same data.

## One component, three shapes

The kind decides what to show:

```tsx
{note.kind === "table" ? <TableEditor … /> : <textarea … />}
{note.kind === "note" && <button onClick={onToTask}>Turn into task</button>}
```

When the branches get long, pull each into a small component in the same file. Use whatever reads best.

## Editing without local state

The drawer in 3d kept a local copy of the title, because renaming a task is a deliberate action. Notes are different: they should save as you type, like a notebook. So the editor has **no local state**. Every change calls a prop right away, the reducer stores it, and the new note comes back as a prop:

```tsx
<input value={note.title} onChange={e => onEdit({ title: e.target.value })} />
```

This is the most common pattern in React: the component shows props and reports changes; something above it owns the data.

## Tables of inputs

Each cell is an input. Give each one an accessible name, so it can be found by tests and announced by VoiceOver:

```tsx
<input aria-label={`Row ${r + 1}, column ${c + 1}`} value={cell} onChange={e => onSetCell(r, c, e.target.value)} />
```

People count from 1 and arrays from 0. Labels use the first, callbacks the second.

Wide tables need to scroll sideways inside their own box (`overflow-x: auto`), not push the whole page sideways. On an iPad in portrait that matters.

## Optional values in selects

The task select has a "No task" option with the value `""`. Convert it back when reporting: `onLink(e.target.value || null)`. Your data uses `null` for "no task", not an empty string.

## Read more
- `<textarea>` in React: <https://react.dev/reference/react-dom/components/textarea>
- Conditional rendering: <https://react.dev/learn/conditional-rendering>

---

## Exercises 5.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 5.2: NoteEditor

**Edit:** `app/client/src/components/NoteEditor.tsx` · **Tests:** `tests/part-5/5.2-note-editor.test.tsx` · **Run:** `npm run ex 5.2`

Build `NoteEditor`: *Title*, *Task* select ("No task" = `null`), *Text* for notes and drafts, a table of labelled cell inputs with *Add row* and *Add column* for tables, *Turn into task* for notes only, and *Delete note*. Then open the Notes page in the app.

---

[← 5a Feature reducers: notes](a-feature-reducers.md) · [5c Resources and attachments →](c-resources.md)
