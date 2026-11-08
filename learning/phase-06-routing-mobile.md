# Phase 6: Routing & mobile layout

**Time:** 6–8 hours · **You build:** the app shell: tab bar, pages and an iPhone-ready layout.

## 1. Learn
- **Client-side routing**: React Router (`Routes`, `Route`, `Link`, `useParams`, `useNavigate`). With GitHub Pages use `HashRouter` or set `base`.
- **Layout components**: a shell with a tab bar and an outlet.
- **Mobile CSS**: `viewport-fit=cover`, `env(safe-area-inset-bottom)`, `100dvh`, touch targets ≥ 44 px, inputs ≥ 16 px (stops Safari zoom), `prefers-color-scheme` for dark mode.
- **Accessibility basics**: real `<button>` and `<a>`, `aria-label` on icon buttons, colour contrast.

## 2. Study the finished app
- `index.html`: the `<meta>` tags for iPhone.
- `styles.css`: `--sab`, `#tabs`, `#view` padding, the dark-mode variables.
- `app.js`: `go()`, `render()`, `renderTabs()`; this is hand-made routing.

## 3. Exercise
Routes: `/` Home, `/topics`, `/topics/:unitId`, `/review`, `/practice`, `/me`.

- [ ] Bottom tab bar highlights the current route and respects the home-bar safe area
- [ ] Topic page loads from the URL; refreshing keeps you there
- [ ] A 404 page for unknown routes
- [ ] Review and exercise screens hide the tab bar
- [ ] Looks right in light and dark mode
- [ ] No sideways scrolling at 390 px; every button is at least 44 px tall
- [ ] Tested on a real iPhone

## 4. Check yourself
1. Why do single-page apps need a fallback on static hosts?
2. What is the safe area and which devices need it?
3. Why do 16 px inputs matter on iOS?
4. How do you make an icon-only button accessible?
