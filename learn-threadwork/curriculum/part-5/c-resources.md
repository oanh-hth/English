# Part 5c: Resources and attachments

*[Part 5: Linked work: notes, resources and the link map](README.md) · section c*

You don't work only with tasks: you use files, links, tools, books and people. Threadwork keeps them in a **resource library**, lets you attach them to tasks, and lets you tick the ones you actually used. In this section you build the resources reducer, the attachments area in the task drawer, and the library page.

## Data that lives in two places

A resource is stored once, in `state.resources`. A task stores only **references**: `{ resourceId, used }`. This is **normalised** data: the resource's name lives in one place, so renaming it updates every task at once.

The cost: deleting a resource must also remove the references, or tasks would point at something that no longer exists.

```ts
case "removeResource":
  return { ...state,
    resources: state.resources.filter(r => r.id !== action.id),
    tasks: state.tasks.map(t => /* drop the reference if present */) };
```

## Reuse what you wrote

Marking a resource as used was already solved in 1.3 (`setResourceUsed`). The reducer just applies it to the right task. As the app grows, this is how it should feel: new features made mostly of pieces you trust.

## Derived data: usage

The library shows "Used in 1 of 2 tasks" for each resource. That's another **selector**, computed from tasks rather than stored:

```ts
resourceUsage(state)  // { r1: { taskIds: ["t1", "t2"], usedIn: 1 }, … }
```

## Checkboxes

A checkbox is controlled with `checked`, not `value`, and reports `e.target.checked`:

```tsx
<input type="checkbox" checked={x.used} aria-label={`Used ${r.name}`} onChange={e => onMarkUsed(r.id, e.target.checked)} />
```

## Links that leave the app

Resource links open in a new tab, so Threadwork stays where you were:

```tsx
<a href={r.url} target="_blank" rel="noreferrer">{r.name}</a>
```

`rel="noreferrer"` stops the other site from controlling the Threadwork tab.

## Forms with several fields

The library's form has a name, a kind and an optional link. One `useState` per field is simplest. After adding, reset all three. Validate before calling the parent: the parent (and the reducer) should get only clean data.

## Read more
- Normalising state (Redux docs, same idea): <https://redux.js.org/usage/structuring-reducers/normalizing-state-shape>
- Checkbox inputs: <https://react.dev/reference/react-dom/components/input#providing-a-controlled-value-for-a-checkbox>
- Links and `rel` (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/noreferrer>

---

## Exercises 5.3–5.5

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 5.3: Resources reducer and usage

**Edit:** `app/shared/resources.ts` · **Tests:** `tests/part-5/5.3-resources-reducer.test.ts` · **Run:** `npm run ex 5.3`

Write `resourcesReducer` (add, remove everywhere, attach once, detach, mark used with `setResourceUsed`) and the `resourceUsage` selector.

### 5.4: TaskAttachments in the drawer

**Edit:** `app/client/src/components/TaskAttachments.tsx` · **Tests:** `tests/part-5/5.4-task-attachments.test.tsx` · **Run:** `npm run ex 5.4`

Build `TaskAttachments`: attached resources with links, *Used* checkboxes and *Remove* buttons; an *Attach a resource* select; the task's notes and sketches as buttons; and *New note*, *New draft*, *New table*. The app already puts it inside your drawer, using the `children` slot from 3.4.

### 5.5: ResourceLibrary page

**Edit:** `app/client/src/components/ResourceLibrary.tsx` · **Tests:** `tests/part-5/5.5-resource-library.test.tsx` · **Run:** `npm run ex 5.5`

Build `ResourceLibrary`: the add form (name required), a table showing kind, "Used in N of M tasks", buttons for the tasks it's attached to, and *Delete*, plus an empty state. Then add your real resources on the Resources page.

---

[← 5b Editors for notes, drafts and tables](b-editors.md) · [5d Graphs and the link map →](d-link-map.md)
