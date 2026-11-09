# Part 1c: Changing data without mutating it

*[Part 1: TypeScript and the task model](README.md) · section c*

Linking two tasks, moving a task to *Done*, deleting one: these are the everyday changes in Threadwork. In this section you write them **without mutating** anything, the single most important habit for React.

## What mutation is

```ts
task.title = "New title";          // mutation: changes the object in place
tasks.push(newTask);               // mutation: changes the array in place
```

Mutation looks harmless, but React decides whether to redraw by asking "is this the same object as before?". If you change an object in place, it is still the same object, so React may not redraw, and your screen shows old data. Undo, sync and "has anything changed?" checks all break the same way.

## Making new objects instead

The **spread** syntax `...` copies the fields of an object or the items of an array into a new one:

```ts
const renamed = { ...task, title: "New title" };        // new object, one field changed
const withLink = { ...task, links: [...task.links, "b"] };  // new object AND new array
```

Changing one item in a list: `map` returns a new array, and you return a new object only for the item that changes:

```ts
const tasks2 = tasks.map(t => (t.id === id ? { ...t, status: "done" } : t));
```

Tasks that don't change are returned as they are. Reusing them is fine and fast. Only the changed task and the array are new.

Removing: `filter` returns a new array without the matching items.

```ts
const remaining = tasks.filter(t => t.id !== id);
```

## Links go both ways

In Threadwork, if *Proposal* links to *Survey*, then *Survey* links to *Proposal*. So `linkTasks(tasks, "a", "b")` must change two tasks in one pass:

```ts
tasks.map(t => {
  if (t.id === a && !t.links.includes(b)) return { ...t, links: [...t.links, b] };
  if (t.id === b && !t.links.includes(a)) return { ...t, links: [...t.links, a] };
  return t;
});
```

Think about the edge cases before you write code: linking a task to itself, to an id that doesn't exist, or twice. The comments in the starter file say what should happen.

## How the tests catch mutation

The tests **freeze** their input with `Object.freeze`. A frozen object throws an error if you try to change it, in strict mode, which test files use. So if your function mutates, you'll see "Cannot assign to read only property". That message means: make a copy instead.

## Read more
- Updating objects in state (React docs): <https://react.dev/learn/updating-objects-in-state>
- Updating arrays in state: <https://react.dev/learn/updating-arrays-in-state>
- Spread syntax (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax>
- `Object.freeze` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze>

---

## Exercises 1.3

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 1.3: Link, move and delete tasks without mutation

**Edit:** `app/shared/task-ops.ts` · **Tests:** `tests/part-1/1.3-immutable-updates.test.ts` · **Run:** `npm run ex 1.3`

Write `linkTasks`, `unlinkTasks`, `moveTask`, `deleteTask` and `setResourceUsed` in `task-ops.ts`. None of them may change their inputs.

- `moveTask` sets `doneAt` to `today` when a task becomes done, and back to `null` when it leaves *Done*. Moving a task to the status it already has changes nothing, so it keeps its original done day.
- `deleteTask` also removes the deleted id from every other task's links.
- `setResourceUsed` attaches the resource first if the task doesn't have it yet.

---

[← 1b Unions, as const and Record](b-unions-and-records.md) · [1d Generics and data from outside →](d-generics-and-unknown.md)
