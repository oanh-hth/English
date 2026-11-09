# Part 3 · React and TypeScript UI

Now the app gets a face. In this part you build the **editor**: a picker for choosing stitches, cards for the rows, the state that holds the chart, and the two chart drawings (rows and rounds). Along the way you learn components, props, state, reducers, events, accessibility and SVG, and how to test components the way people use them.

Everything you wrote in parts 1 and 2 is reused: the cards show your `itemText` and `rowStats`, the reducer calls your `chartOps`, and the drawings use your `expand`.

## Sections
* [a · Components and props](a-components-and-props.md) → exercise 3.1
* [b · State and reducers](b-state-and-reducers.md) → exercises 3.2, 3.3
* [c · Drawing the chart](c-drawing-the-chart.md) → exercises 3.4, 3.5
* [d · Round charts](d-round-charts.md) → exercises 3.6, 3.7

## The app after this part
The editor works: pick a stitch, add it to the active row, create groups, add rows, and watch the cards, the written pattern and the symbol chart update, both as flat rows and as rings.

## Finish the part
Tick the items with `npm run learn`, write your answers in `notes/part3.md`, and do the milestone: build a small pattern in the running editor and switch between *Flat rows* and *In the round*.

### Review questions
1. What does "controlled component" mean? Name the two props involved.
2. Why does the reducer return the *same* state object when nothing changes?
3. What problem does `stopPropagation` solve in `RowCard`?
4. Why do the tests find elements by role and name instead of by class name?
5. What does the `never` assignment at the end of a `switch` protect you from?
6. Why is a layout function (`layoutFlat`, `layoutRound`) separate from the component that draws it?
