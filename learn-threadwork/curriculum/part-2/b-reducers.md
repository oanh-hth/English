# Part 2b: A reducer for the whole app

*[Part 2: The app's logic: dates, a reducer and queries](README.md) · section b*

Every change in Threadwork goes through one function, the **reducer**. In this section you write it, using everything from Part 1.

## Actions

Describe each change as a plain object with a `type`:

```ts
type TaskAction =
  | { type: "add"; id: string; title: string; complexity: Complexity; due: string | null; today: string }
  | { type: "complete"; id: string; today: string }
  | { type: "recordOutcome"; id: string; outcome: unknown; today: string }
  | { type: "reopen"; id: string }
  // …
```

This is a **discriminated union**: every member has a different `type`. Code that checks `action.type` gets exactly the fields of that action.

## A reducer

```ts
function tasksReducer(state: AppState, action: TaskAction): AppState {
  switch (action.type) {
    case "complete":
      return { ...state, tasks: completeSimple(state.tasks, action.id, action.today) };
    // …
  }
}
```

The reducer doesn't repeat any logic: it **delegates** to the functions you wrote in 1.3. Its job is to know which function each action needs.

Why one reducer for everything? All the ways your data can change sit in one place. Each change is data that you can log, test, or send to another device. React's `useReducer` (Part 4) is built around exactly this shape.

## Never trust what an action carries

`recordOutcome` carries `outcome: unknown`, because it comes straight from a form. Check it with `parseOutcome` (1.4) before saving. If it's invalid, nothing happens. The form already showed the error to the person, but the reducer doesn't rely on that.

## Return the same state when nothing changes

When the 1.3 function returns the same array, return the same **state** too:

```ts
const withTasks = (state: AppState, tasks: Task[]) => (tasks === state.tasks ? state : { ...state, tasks });
```

React then knows nothing needs to redraw or be saved.

## `replace`

When your other device's data arrives from the server, the whole state is replaced in one action. That's how sync (Part 7) plugs into the same reducer.

## Read more
- Extracting state logic into a reducer: <https://react.dev/learn/extracting-state-logic-into-a-reducer>
- Discriminated unions: <https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions>

---

## Exercises 2.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 2.2: The tasks reducer

**Edit:** `app/shared/tasks-reducer.ts` · **Tests:** `tests/part-2/2.2-tasks-reducer.test.ts` · **Run:** `npm run ex 2.2`

Write `tasksReducer` for every action in `TaskAction`. Use your Part 1 functions; validate outcomes with `parseOutcome`; return the same state whenever nothing changes.

---

[← 2a Pure functions and dates](a-pure-functions-and-dates.md) · [2c Queries: the decision log and the weekly summary →](c-queries.md)
