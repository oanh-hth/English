# Phase 5: Persistence & app state

**Time:** 5–7 hours · **You build:** progress, settings and streaks that survive a reload.

## 1. Learn
- **localStorage**: `getItem`/`setItem`, JSON serialization, ~5 MB limit, that it throws in some private modes, per-origin scope.
- **Shared state in React**: lifting state up, Context, or a small store (Zustand). Keywords: *useContext, useReducer, Zustand*.
- **Reducers**: `(state, action) => newState`; why they're easy to test.
- **Schema versioning**: a `version` field and migrating old saved data.
- **Dates**: a "day key" (`2026-11-08`) for daily limits and streaks.

## 2. Study the finished app
- `app.js`: `defaults()`, the `S` load/merge code, `save()`, `today()`, `bump()`, `streak()`.
- Notice the merge `{ ...defaults, ...saved }`, which lets old saves gain new fields without crashing.

## 3. Exercise
- [ ] A store holds `cards` (id → card state), `log` (day → counts), `settings`
- [ ] Reading from storage is wrapped in `try/catch` and falls back to defaults
- [ ] Every change saves automatically (one place, not scattered calls)
- [ ] Reviewing a card (use your Phase 4 scheduler) updates its state and the day's count
- [ ] Streak = consecutive days with any activity; unit-test it with fake dates
- [ ] "Reset all progress" asks for confirmation
- [ ] Reload keeps everything

## 4. Check yourself
1. Why wrap `localStorage` access in `try/catch`?
2. What breaks if you rename a field in saved data and ship it?
3. Why can't localStorage sync a phone and a laptop?
4. When would IndexedDB be a better choice?
