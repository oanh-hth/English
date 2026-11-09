# 1c · Editing without mutating

The editor lets the user add a row, remove a row, move a row, and add stitches. Those are all "take a chart, return a changed chart". How you write them decides whether the React app in part 3 behaves or misbehaves, so we practise here, with no React in the way.

## Mutation and why it bites
```ts
function addRowBad(chart: Chart) {
  chart.rows.push(newRow);     // changes the chart you were given
  return chart;
}
```
This works, and it is a trap. The caller still holds the same object, now changed behind its back. React decides whether to redraw by asking "is this a different object than last time?". If you return the *same* object, React answers no, and your screen does not update. Mutation also breaks undo, makes bugs hard to trace, and makes tests awkward.

## Immutable updates
Instead, build a **new** object that shares everything that did not change:
```ts
function addRow(chart: Chart): Chart {
  return { ...chart, rows: [...chart.rows, newRow] };
}
```
* `{ ...chart, rows: x }` copies all the properties of `chart`, then replaces `rows`.
* `[...chart.rows, newRow]` makes a new array with one more element.
* The old chart is untouched. The old rows are *shared*, not copied, which is cheap.

Methods that **change** the array (avoid on shared data): `push`, `pop`, `splice`, `sort`, `reverse`, and assigning to a property. Methods that **return a new** one (safe): `map`, `filter`, `slice`, spread, `concat`.

Updating one item in a list is a `map`:
```ts
rows.map((row) => (row.id === rowId ? { ...row, note: 'new' } : row));
```
Every row except the chosen one is returned as is (the same object).

Swapping two elements without mutating the original:
```ts
const rows = [...chart.rows];                 // a copy
[rows[a], rows[b]] = [rows[b], rows[a]];      // swap in the copy
return { ...chart, rows };
```

## "Nothing changed" returns the same object
When a request cannot change anything (an unknown row id, moving the first row up), return the **very same** object you were given. React and other tools use `===` to skip needless work, and your tests can check `toBe(chart)`.

## A helper makes it small
Seven operations sound like a lot, but most of them are the same dance: find the row, change it, put it back. Write one private helper:
```ts
function updateRow(chart: Chart, rowId: string, change: (row: Row) => Row): Chart {
  if (!chart.rows.some((r) => r.id === rowId)) return chart;        // nothing to do: same object
  return { ...chart, rows: chart.rows.map((r) => (r.id === rowId ? change(r) : r)) };
}
```
`addStitch`, `addGroup` and `removeItem` can then be a few lines each. Passing a function as an argument (`change`) is the idea behind `map`, `filter` and event handlers: you will meet it everywhere in React.

## Freezing in tests
The tests for this exercise freeze their input with `deepFreeze`: in strict mode, any attempt to change a frozen object throws an error. If your code mutates, the test fails with a clear message instead of a mysterious wrong answer later.

## What the app can do now
Nothing new on screen yet: these functions are the foundation of the reducer you write in part 3. But the model is complete. Check the milestone: `npm run typecheck` is clean, and the *Written pattern* panel of the editor shows your text.

## Exercises 1.6.

| | | file you edit |
|---|---|---|
| **1.6** [Edit a chart without changing it](../../exercises/part1-typescript/1.6-chart-ops/README.md) | immutability, spread, `map`/`filter` | `src/core/chartOps.ts` |

When it is green: tick the items for part 1 with `npm run learn`, write your answers to the [review questions](README.md) in `notes/part1.md`, do the milestone, and move to [part 2](../part2-parsing/README.md).
