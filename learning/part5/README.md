# Part 5: Routing and the app shell

Until now you swapped screens with state. Real apps have **URLs**: you can refresh a page, share a link, and use the back button. In this part you add routing and finish the app's skeleton: Home, Topics, topic pages, Practice, Me, with a mobile tab bar.

| Lesson | Topic | Exercises |
|---|---|---|
| [a](a-routing.md) | Client-side routing | 5.1 – 5.5 |
| [b](b-pages.md) | The main pages, driven by data | 5.6 – 5.11 |
| [c](c-shell-polish.md) | Tab bar, safe areas, dark mode, accessibility | 5.12 – 5.16 |

## Checkpoint 5

- [ ] Routes: `/`, `/topics`, `/unit/:unitKey`, `/learn/:unitKey/:kind`, `/review`, `/practice`, `/me`, plus a 404 page
- [ ] Refreshing any page keeps you on it; the back button works
- [ ] A bottom tab bar highlights the current tab and is hidden during Learn and Review
- [ ] Works on your phone, in light and dark mode, with the home-bar safe area respected
- [ ] `git tag part5`

## Reference files to compare afterwards
`app.js`: `go`, `render`, `renderTabs`, `VIEWS`, `IMMERSIVE`; `units-ui.js`: `SN.VIEWS.library`, `SN.VIEWS.unit`, `SN.VIEWS.practice`; `styles.css`: `#tabs`, `#view`.
