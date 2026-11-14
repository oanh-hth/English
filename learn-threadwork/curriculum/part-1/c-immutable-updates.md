# Part 1c: Changing data without mutating it

*[Part 1: TypeScript and the task model](README.md) · section c*

Ticking a task, recording a decision, reopening, deleting: these are Threadwork's everyday changes. In this section you write them **without mutating** anything, the single most important habit for React.

## What mutation is

```ts
task.status = "done";          // mutation: changes the object in place
tasks.push(newTask);           // mutation: changes the array in place
```

React decides whether to redraw by asking "is this the same object as before?". If you change an object in place, it is still the same object, so React may not redraw and your screen shows old data. Sync and "has anything changed?" checks break the same way.

## Making new objects instead

```ts
const done = { ...task, status: "done", doneAt: today };          // new object
const withOutcome = { ...task, outcome: { ...outcome } };          // new nested object too
const tasks2 = tasks.map(t => (t.id === id ? { ...t, status: "done" } : t));   // new list, one item replaced
const remaining = tasks.filter(t => t.id !== id);                  // new list, one item removed
```

Tasks that don't change are returned as they are. Only the changed task and the array are new.

## Rules belong in these functions

Each function protects a rule of the app, so no screen can break it:

- `completeSimple` only ticks **simple** tasks. A complex task can't be "just done"; it needs its outcome.
- `recordOutcome` only accepts **complex** tasks. If you edit a decision a week later, the task keeps the day it was **first** done.
- `reopenTask` keeps the outcome, so reopening and finishing again doesn't lose what you wrote.
- `setComplexity` only works while the task is to do.

## Return the same array when nothing changes

If the id is unknown, or the change isn't allowed, return **the array you received**. Not a copy, the same one. Then callers (and React) can tell "nothing happened" with a cheap `===` check. The tests check it with `toBe`.

A helper makes that easy:

```ts
const update = (tasks: Task[], id: string, fn: (t: Task) => Task) => {
  let changed = false;
  const out = tasks.map(t => { if (t.id !== id) return t; const n = fn(t); if (n !== t) changed = true; return n; });
  return changed ? out : tasks;
};
```

## How the tests catch mutation

The tests **freeze** their input. A frozen object throws when changed, so a mutation shows up as "Cannot assign to read only property": make a copy instead.

## Read more
- Updating objects in state: <https://react.dev/learn/updating-objects-in-state>
- Updating arrays in state: <https://react.dev/learn/updating-arrays-in-state>
- Spread syntax (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax>

---

## Exercises 1.3

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 1.3: Complete, record, reopen and delete tasks

**Edit:** `app/shared/task-ops.ts` · **Tests:** `tests/part-1/1.3-immutable-updates.test.ts` · **Run:** `npm run ex 1.3`

Write `renameTask`, `setComplexity`, `completeSimple`, `recordOutcome`, `reopenTask` and `deleteTask`. None may change their inputs, and each returns the same array when nothing changes.

---

[← 1b Unions, as const and the category list](b-unions-and-records.md) · [1d Generics and data from outside →](d-generics-and-unknown.md)
