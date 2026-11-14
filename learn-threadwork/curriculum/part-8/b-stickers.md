# Part 8b: Stickers

*[Part 8: Themes, stickers and folders](README.md) · section b*

A sticker says how a decision *felt*: an insight, something you're proud of, a gotcha you'll want to remember, something to revisit later. In this section you add stickers to the data and build the components to show and pick them.

## A small feature reducer

Stickers live on the outcome: `outcome.sticker` is a sticker id or `null`. Setting one is a new action:

```ts
{ type: "setSticker", id: "t1", sticker: "rocket" }
```

Rather than growing `tasksReducer`, stickers get their own small reducer. The given `rootReducer` chains them:

```ts
export function rootReducer(state, action) {
  const next = tasksReducer(state, action);
  return stickersReducer(next, action);
}
```

This works because of a rule you've followed since Part 2: **a reducer returns the same state for actions that aren't its own.** Each reducer ignores what it doesn't understand, so you can chain as many as you like.

The rules belong in the reducer, not the screen: only finished tasks with an outcome get stickers, unknown sticker ids are ignored, and setting the sticker that's already there changes nothing. Then the screen can't break them.

## Why `outcome` keeps the sticker optional

`sticker?: string | null` is optional in the type, so every decision saved before Part 8 is still valid. When a data shape grows, make new fields optional (or give them defaults) and old data keeps working.

## Showing a sticker

A sticker is a picture that means something, so it needs a name for people who can't see it:

```tsx
<span className="sticker" role="img" aria-label={`Sticker: ${s.name}`} dangerouslySetInnerHTML={{ __html: s.svg }} />
```

If the id is unknown (a sticker removed in a later version), render nothing. `null` is a valid thing for a component to return.

## Picking a sticker: real radio buttons

For a small picker, use real radio inputs. You get keyboard support, grouping and screen reader announcements for free:

```tsx
<fieldset>
  <legend>Sticker</legend>
  <label><input type="radio" name="sticker" checked={value === null} onChange={() => onChange(null)} /> None</label>
  {STICKERS.map(s => (
    <label key={s.id}>
      <input type="radio" name="sticker" checked={value === s.id} onChange={() => onChange(s.id)} />
      <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: s.svg }} />
      <span className="visually-hidden">{s.name}</span>
    </label>
  ))}
</fieldset>
```

`<fieldset>` + `<legend>` names the group ("Sticker"). The drawing is hidden from screen readers, and the visually hidden name labels each option. The CSS hides the round radio dot but keeps the input focusable, and highlights the chosen label with `:has(input:checked)`.

## Read more
- `<fieldset>` and `<legend>` (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset>
- `:has()` (MDN): <https://developer.mozilla.org/en-US/docs/Web/CSS/:has>
- The img role (MDN): <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/img_role>

---

## Exercises 8.3–8.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 8.3: Stickers on decisions

**Edit:** `app/shared/stickers.ts` · **Tests:** `tests/part-8/8.3-stickers.test.ts` · **Run:** `npm run ex 8.3`

Write `isStickerId` and `stickersReducer` (the `setSticker` action, with its rules). The given `rootReducer` already sends every action through it, and the Tasks page dispatches `setSticker` right after saving an outcome.

### 8.4: Sticker and StickerPicker

**Edit:** `app/client/src/components/Stickers.tsx` · **Tests:** `tests/part-8/8.4-stickers-ui.test.tsx` · **Run:** `npm run ex 8.4`

Build `Sticker` (a named `role="img"`, or nothing for unknown ids) and `StickerPicker` (a fieldset of real radio buttons: None plus every sticker, each named). The picker appears under the outcome form; finish a complex task and give it a sticker.

---

[← 8a Animated SVG scenes](a-svg-scenes.md) · [8c Folders and paper notes →](c-folders.md)
