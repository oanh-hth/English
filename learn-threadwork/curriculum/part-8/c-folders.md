# Part 8c: Folders and paper notes

*[Part 8: Themes, stickers and folders](README.md) · section c*

The decision log from Part 5 is a list. Here it becomes a shelf: one illustrated folder per topic, coloured by group, with the stickers of its decisions on the cover. Open a folder and its decisions lie inside as paper notes.

## Grouping again, with a fixed order

`foldersOf(decisions)` is a query like those in Part 2: one folder per category **that has decisions**, in the category list's order, with unknown categories last. Each folder knows its count, its newest day and up to three distinct stickers, newest first:

```ts
const stickers = [...new Set(list.map(d => d.sticker).filter(Boolean))].slice(0, 3);
```

A `Set` keeps the first time it sees each value, so newest-first in means newest-first out.

## The shelf: data to pictures

`FolderShelf` groups folders under group headings and draws each one with the given `FolderArt`. The folder itself is SVG: a back panel, two papers peeking out, a front panel, and the stickers placed at fixed spots, each slightly rotated. Each folder is one button with a full name ("React, 3 decisions"). Screen reader users hear what's inside without the drawing.

## Paper notes

An open folder shows each decision as a note, styled with nothing but CSS:

- a lined-paper background: `repeating-linear-gradient(transparent 0 27px, #E3E9F2 27px 28px)`;
- a paper clip: a bordered, rounded box with one side transparent;
- a small, different tilt per note, passed as a CSS variable:

```tsx
<article className="note" style={{ "--tilt": `${TILTS[i % 4]}deg` } as CSSProperties}>
```

```css
.note { transform: rotate(var(--tilt)) }
@media (prefers-reduced-motion: reduce) { .note { transform: none } }
```

CSS variables let a component hand a value to its stylesheet without writing a class for every case. TypeScript doesn't know about `--tilt`, hence the `as CSSProperties`.

## Two views, one source

The page now has *Folders* and *List*. Both read the same `decisionsOf(state.tasks)`; neither stores anything. Switching views can't make them disagree. That's the "derive, don't store" rule from Part 2 paying off.

## Read more
- `repeating-linear-gradient` (MDN): <https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/repeating-linear-gradient>
- Using CSS custom properties (MDN): <https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties>
- `Set` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set>

---

## Exercises 8.5–8.7

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 8.5: One folder per category

**Edit:** `app/shared/folders.ts` · **Tests:** `tests/part-8/8.5-folders.test.ts` · **Run:** `npm run ex 8.5`

Write `foldersOf(decisions)`: one folder per used category in list order (unknown ones last, as group "Other"), with name, group, count, latest, up to three distinct stickers newest first, and the decisions.

### 8.6: FolderShelf

**Edit:** `app/client/src/components/FolderShelf.tsx` · **Tests:** `tests/part-8/8.6-folder-shelf.test.tsx` · **Run:** `npm run ex 8.6`

Build `FolderShelf`: a named section per group (Frontend, Backend, Workflow, Other) with a heading and one button per folder ("React, 3 decisions") showing `FolderArt`, the name and "3 decisions · latest …", plus an empty state.

### 8.7: FolderView: paper notes

**Edit:** `app/client/src/components/FolderView.tsx` · **Tests:** `tests/part-8/8.7-folder-view.test.tsx` · **Run:** `npm run ex 8.7`

Build `FolderView`: a section named "<name> folder" with *All folders*, the name and count, and a tilted `note` article per decision with its title, date, sticker, Result and Decision, and *Edit*. Then open a folder on the Decisions page.

---

[← 8b Stickers](b-stickers.md) · [Back to the course overview →](../../README.md)
