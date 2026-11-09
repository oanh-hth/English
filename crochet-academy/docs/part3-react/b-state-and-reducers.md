# 3b · State and reducers

A page changes when the user does something: they pick a stitch, add it to a row, rename the chart. The things that change over time are **state**. In this section we decide where the chart lives and how it is updated, then build the card that shows one row.

## `useState`
```tsx
const [count, setCount] = useState(1);
```
`useState` gives you the current value and a function to replace it. Calling `setCount` makes React run the component again with the new value. You never *edit* state; you **replace** it, which is why the immutable style of part 1 matters.

## Many changes to one object: `useReducer`
The chart changes in a dozen ways: rename, switch mode, add row, remove row, move row, add stitch, add group, remove item, set note, set colour, dismiss hint. Spreading all of this over many `useState` calls gets messy. A **reducer** collects every rule in one function:

```ts
type Action =
  | { type: 'rename'; name: string }
  | { type: 'addRow'; color?: string }
  | { type: 'removeRow'; rowId: string };

function reducer(state: Chart, action: Action): Chart {
  switch (action.type) {
    case 'rename':    return { ...state, name: action.name };
    case 'addRow':    return addRow(state, action.color);       // your function from 1.6
    case 'removeRow': return removeRow(state, action.rowId);
    default: {
      const unreachable: never = action;
      return unreachable;
    }
  }
}

const [chart, dispatch] = useReducer(reducer, initialChart);
dispatch({ type: 'rename', name: 'Leaf' });
```
* The actions are a **discriminated union** again (`type` is the discriminant), so each `case` knows exactly which fields it has.
* The reducer is a **pure function**, so you can test it without React: pass a chart and an action, check the chart that comes out. That is what exercise 3.2 does.
* The `default` branch assigns `action` to a variable of type **`never`**. If you add a new action type and forget to handle it, `action` is no longer `never` there and TypeScript refuses to compile. The compiler reminds you of every case.
* If nothing changes, return the **same** state object; React then skips the update.

The reducer here is thin because your `chartOps` already do the real work. It only wires actions to them, plus a few small updates (`rename`, `setNote`, ...).

The provided hook `useChart` wraps `useReducer(chartReducer, initial)`; the editor page uses it for everything you click.

## A card for a row
`RowCard` shows one row: a heading ("Row 3" or "Round 3"), a pill with the stitch count, the stitches as chips, a delete button and a note box. It uses `rowStats` (1.3) and `itemText` (1.4).

Two ideas matter here:

**Controlled inputs.** The note box is `<textarea value={row.note} onChange={...}>`. The *value* comes from props, and every keystroke calls `onNoteChange(row.id, newText)`; the parent updates state and the new value flows back down. The card keeps no text of its own.

**Events bubble.** A click on the delete button is also a click on the card around it, so the card's `onClick` (select this row) would run too. `event.stopPropagation()` stops the click from travelling up:
```tsx
onClick={(event) => {
  event.stopPropagation();
  onRemove(row.id);
}}
```
Without it, deleting a row would also try to select the row you just deleted.

**Conditional rendering.** `{row.items.length ? <ul>...</ul> : <p>Empty...</p>}` shows one thing or the other. In JSX, `?:` and `&&` are the usual tools.

## Pure data in, UI out
Notice how little logic the card contains. The decisions (how many stitches, how to write them) are in tested functions; the component just lays them out. This is how a React app stays understandable as it grows.

## What the app can do now
With 3.2 and 3.3 green, the editor responds: pick a stitch, press **Add stitch**, and it appears as a chip in the active row's card; **+ Add row** appends a new card; the x deletes a row; typing in a note updates the written pattern.

## Exercises 3.2.-3.3.

| | | file you edit |
|---|---|---|
| **3.2** [The chart reducer](../../exercises/part3-react/3.2-chart-reducer/README.md) | `useReducer`, `never` | `src/client/state/chartReducer.ts` |
| **3.3** [A row card](../../exercises/part3-react/3.3-row-card/README.md) | controlled input, bubbling | `src/client/components/RowCard.tsx` |

Next: [3c · Drawing the chart](c-drawing-the-chart.md).
