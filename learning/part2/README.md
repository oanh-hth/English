# Part 2: React basics: browsing

You learn how React thinks, then build the browsing half of the app: a Topics list, a topic page with a searchable phrase list, a detail sheet, all styled for a phone.

| Lesson | Topic | Exercises |
|---|---|---|
| [a](a-components-props.md) | Components and props | 2.1 – 2.5 |
| [b](b-lists-search.md) | Lists, keys, conditionals and search | 2.6 – 2.10 |
| [c](c-styling-mobile.md) | Styling and mobile layout | 2.11 – 2.15 |

## Checkpoint 2

- [ ] Topics screen groups units and shows counts
- [ ] Tapping a unit shows its phrases and words
- [ ] Search filters results and shows a message when there are none
- [ ] Tapping an item opens a bottom-sheet detail view
- [ ] No horizontal scrolling at 390 px wide; buttons at least 44 px tall
- [ ] Looks right in light and dark mode
- [ ] `git tag part2`

(Navigation here is done with component state. Part 5 replaces that with real routes.)

## Reference files to compare afterwards
`units-ui.js` (`unitItem`, `SN.VIEWS.library`, `SN.VIEWS.unit`), `app.js` (`phraseList`, `phraseDetail`), `styles.css`.
