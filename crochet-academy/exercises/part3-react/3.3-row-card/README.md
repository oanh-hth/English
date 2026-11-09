# 3.3 · A row card

**Concepts:** composing your pure functions into JSX, conditional rendering, controlled inputs, event bubbling and `stopPropagation`.

**Prerequisites:** 1.3, 1.4.

**File to edit:** `src/client/components/RowCard.tsx`

## What to build
The card for one row in the editor: a heading ("Row 3" or "Round 3"), the stitch count pill, the stitch chips written with your `itemText`, a delete button and a note box. The exact markup is listed in the comment above the component; the tests look elements up by role and name.

Two things to get right:
* the note box is **controlled**: `value={row.note}` and `onChange` reports the *whole new text*; the parent owns the state.
* clicking Delete must **not** also select the row. Events bubble from the button to the card unless you stop them.

## See it
`npm run dev`, add a few stitches in the editor: each row shows up as a card.

## Done when
`npm run learn test 3.3` is green.
