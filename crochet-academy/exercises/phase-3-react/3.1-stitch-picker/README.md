# 3.1 · The stitch picker

**Concepts:** function components, props typed with an interface, rendering lists with `key`, event handlers, accessible markup (read `docs/phases/phase-3-react.md`).

**Prerequisite:** 1.1.

**File to edit:** `src/client/components/StitchPicker.tsx`

## What to build
A grid of buttons for choosing a stitch. The component is *controlled*: it does not remember the choice; the parent passes `selected` and gets `onSelect`.

* a `<fieldset>` + `<legend>` per category, buttons inside;
* each button: accessible name = stitch name, `aria-pressed` = selected, the `<Glyph>` icon, and the abbreviation as text;
* with `uk` the names and abbreviations switch.

The tests find elements the way a screen reader user would (`getByRole('button', { name: ... })`). If your markup is accessible, the tests pass.

## See it
`npm run dev`, open the editor: the picker appears where the placeholder card is now.

## Done when
`npm run learn test 3.1` is green.
