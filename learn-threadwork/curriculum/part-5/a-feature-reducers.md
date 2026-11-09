# Part 5a: Feature reducers: notes

*[Part 5: Linked work: notes, resources and the link map](README.md) · section a*

This part is about Threadwork's central idea: **everything links to a task**. Notes for the things you might forget, drafts, small data tables, the resources you used, and later sketches, all connect to tasks. In this section you add notes, drafts and tables, each with its own **feature reducer**.

## One reducer per feature

The app reducer from Part 4 handles tasks. If notes, resources, sketches, treats and pins all went into it, it would grow to hundreds of lines. Instead, each feature gets its own reducer with its own actions, in its own file:

```ts
export type NoteAction =
  | { type: "addNote"; id: string; kind: NoteKind; taskId: string | null; now: number }
  | { type: "editNote"; id: string; title?: string; body?: string; now: number }
  // …
```

The given `rootReducer` passes every action to every reducer, one after the other:

```ts
let next = appReducer(state, action);
next = notesReducer(next, action);
next = resourcesReducer(next, action);
// …
```

Each reducer handles its own actions and returns the **same state** for everything else (`default: return state`). That rule is what makes the chain work.

## Several reducers can react to one action

When you delete a task, the app reducer removes it, but its notes would still point at a task that no longer exists. The notes reducer also listens for `"delete"` and detaches those notes:

```ts
case "delete":
  return state.notes.some(n => n.taskId === action.id)
    ? { ...state, notes: state.notes.map(n => (n.taskId === action.id ? { ...n, taskId: null } : n)) }
    : state;
```

Returning `state` when no note was affected keeps React from redrawing for nothing.

## Feature reducers see the whole state

A feature reducer receives the entire `AppState`, so it can change more than its own slice when it has to. "Turn this note into a task" creates a task (with your `createTask` from 1.1) **and** links the note to it, in one action.

## Tables as arrays of arrays

A data table is `rows: string[][]`, where `rows[0]` is the header. Updating one cell immutably is two nested `map`s:

```ts
rows.map((r, i) => (i === row ? r.map((c, j) => (j === col ? value : c)) : r));
```

Adding a column adds one item to every row. Copy the starting table for every new note (`NEW_TABLE.map(r => [...r])`): sharing it would mean editing one table edits them all.

## Time as a parameter

Notes remember `updatedAt` so the list can show recent notes first. The reducer doesn't call `Date.now()`; the action carries `now`. The reducer stays pure, and tests can use simple numbers.

## Read more
- Splitting reducers (Redux docs, same idea): <https://redux.js.org/usage/structuring-reducers/splitting-reducer-logic>
- Updating nested arrays: <https://react.dev/learn/updating-arrays-in-state#updating-objects-inside-arrays>

---

## Exercises 5.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 5.1: Notes, drafts and tables reducer

**Edit:** `app/shared/notes.ts` · **Tests:** `tests/part-5/5.1-notes-reducer.test.ts` · **Run:** `npm run ex 5.1`

Write `notesReducer`: add, edit, table cells, rows and columns, link, delete, turn a note into a task, and detach notes when their task is deleted. Return the same state for every other action.

---

[← Part 5 overview](README.md) · [5b Editors for notes, drafts and tables →](b-editors.md)
