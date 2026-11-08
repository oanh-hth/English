# Phase 5 · Full stack and the capstone

**Goal:** connect the browser to the API you built, then finish with a real algorithm.

## 1. A typed API client
One private `request<T>()` function does the work (headers, JSON, errors); the public methods are one-liners:
```ts
async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> { … }
list: () => request<Chart[]>('/api/charts'),
```
The generic `T` says what the JSON is expected to be. TypeScript cannot *check* what the server sends, so the type is a promise you keep by validating on the server (phase 4).

Errors get their own class (`ApiError`) with a `status` and `messages`, so the UI can show them. A network failure is a different problem and passes through unchanged. (5.1)

Pass `fetch` in as a parameter: tests supply a fake that returns canned responses, so they run in milliseconds with no server.

## 2. Custom hooks
A hook is a function whose name starts with `use` and that may call other hooks. It packages *behaviour with state* so many components can share it. `useCharts` owns "the list of charts on the server": loading, error, create, remove, refresh. The page just renders. (5.2)

Three rules of thumb for effects:
* **Cleanup:** an `await` can finish after the component is gone; guard state updates (`mounted` ref).
* **Dependencies:** `useCallback`/`useEffect` list what they use. An object created on every render (like a new `api`) as a dependency causes an endless loop. Create it once (`useMemo` in `App`, or outside the hook call in a test).
* **Update after success:** `await api.create()` first, *then* change local state, so a failure leaves the list untouched.

## 3. States, not booleans
`'loading' | 'ready' | 'error'` is one value that can only be in one state. Three separate booleans (`isLoading`, `isError`, `hasData`) can contradict each other. Model states as a union.

## 4. The capstone algorithm
`estimateRounds` counts the rounds of a crocheted circle from the brightness along a line from its centre to its edge. It chains four ideas: *window* the data (ignore the centre knot and the edge), *detrend* it (subtract a moving average to remove lighting), *test frequencies* (how strongly does a wave with N cycles match?) and *pick the best*. It is a tiny piece of signal processing, and your tests use synthetic data where you know the right answer. Testing numeric code with data you generated yourself is a powerful trick.

## 5. Where to go from here
The checklist is complete when the last exercise is green and you have ticked the milestones. Then keep building: each of these is a good project.

* **Round layout:** write `layoutRound` (wedges around rings, counter-clockwise from the top) and make `SymbolChart` use it for `mode === 'round'`.
* **Photo import:** wire `estimateRounds` into a dialog. Draw the photo on a `<canvas>`, sample brightness along rays from a centre the user clicks, and build a flat-circle chart. The original app in `../crochet/app.js` does this; compare.
* **Undo/redo:** wrap `chartReducer` in a history reducer.
* **Persistence upgrade:** replace the JSON file with SQLite behind the same `ChartRepository` interface.
* **Types across the wire:** share the validators between server and client, or generate them with a schema library.
* **E2E test:** add a Playwright test that creates a chart through the UI.
* **Deploy:** `npm run build`, then `npm run dev:server` serves the built app from `dist/`.

## Checkpoint (write answers in `notes/phase-5.md`)
1. Why does `useCharts` call the API *before* updating its state in `create`?
2. What causes an infinite render loop when an object is a hook dependency, and how do you avoid it?
3. Why is `'loading' | 'ready' | 'error'` better than three booleans?
4. In `estimateRounds`, why subtract a moving average before looking for waves?
5. Which exercise in this course taught you the most? What would you teach a friend about it?

## Milestone
Reload the page once after 5.1 and 5.2 are green: the note about saving in your browser disappears, and the app now talks to your own server.

In the browser (`npm run dev`): create a chart, edit it, **Save**, reload, open it again. Delete it. Stop and restart the server: the saved charts are still there.
