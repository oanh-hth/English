# Phase 2: React: components, props, lists

**Time:** 5–8 hours · **You build:** the Topics list, a topic page and a phrase list, with static data.

## 1. Learn
- **JSX**, function components, props and `children`.
- **Rendering lists**: `.map()` and the `key` prop (use stable IDs, never the array index when order can change).
- **Conditional rendering**: `&&`, ternaries, early return.
- **Component design**: when to split a component; props vs state.
- **CSS in React**: plain CSS or CSS Modules. Keywords: *flexbox, grid, gap*.
- **TypeScript with React**: typing props, `React.ReactNode`.

## 2. Study the finished app
- `units-ui.js`: `unitItem()`, `SN.VIEWS.library` (Topics) and `SN.VIEWS.unit` (topic page). These build HTML strings; in React you'll write components instead.
- `styles.css`: `.item`, `.card`, `.pill`, `.bar`. Reuse the idea, not the file.

## 3. Exercise
Build with `sample-data/*.json`.

- [ ] `TopicList` shows each topic with name, item count and a progress bar
- [ ] Clicking a topic shows `PhraseList` (phrase, meaning, "New" pill)
- [ ] `PhraseCard` is a reusable component with typed props
- [ ] A search box filters phrases by text
- [ ] Empty search results show a friendly message
- [ ] Looks right at 390 px wide (Chrome DevTools device mode)

## 4. Check yourself
1. What happens if two list items share the same `key`?
2. Where should the search text live: the box, the list, or their parent? Why?
3. What triggers a React re-render?
4. How would you stop `PhraseCard` re-rendering when nothing changed?
