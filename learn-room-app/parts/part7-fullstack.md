# Part 7: Connecting to the server

> Generated from `parts/_theory` and `curriculum.json` by `npm run docs`. Edit those, not this file.

**In this part:** Write the client for your API, the hook that keeps the screen in sync, and the App that ties it together.

Now client and server meet. We write a typed client for our API, a hook that keeps the screen in sync with the server, and the `App` that composes everything. At the end of this part you use the app in your browser.

## a) A typed API client

`fetch` does **not** reject on 404 or 500. It only rejects when the network fails. You must check `response.ok` yourself:

```ts
const response = await fetchImpl(url, init);
if (!response.ok) throw new ApiError(response.status, message);
```

The error body may not be JSON (a proxy's HTML page), so parse it in `try/catch` and fall back to `HTTP 502`. A `204` has no body: do not call `json()`.

`fetchImpl` is a **parameter**. In the browser you pass the real `fetch`; in tests a fake that returns a `Response`. No network, no mock library.

## b) Effects

`useEffect(() => { load(); return () => { cancelled = true } }, [api])` runs after render. The returned **cleanup** runs before the next effect and on unmount: set a `cancelled` flag so a slow response cannot update a component that is gone.

Rules of hooks: call them at the top level, in the same order every render, never after an early `return`.

`useCallback` keeps a function's identity stable between renders so effects and memoised children that depend on it do not re-run.

## c) Optimistic updates

Dragging an item should feel instant. So:

1. Dispatch the change locally **now**.
2. Send it to the server.
3. If the server says no, **roll back**: reload the real state and show the error.

Adding an item is *not* optimistic because the server decides the id and whether the rebuy rule retired something.

## d) Composition

`App` takes `api` and `today` as props (again: injection). It owns the small bits of UI state (`selectedId`, `addError`), asks `useItems` for the data and passes it down. It contains almost no logic: the logic is in the domain, the hook and the components you already tested.

## e) Run it

```bash
npm run server     # terminal 1: API on http://localhost:3001, data in data/items.json
npm run dev        # terminal 2: React app on http://localhost:5173 (forwards /api to the server)
```

Add a few items. Add "Sữa tươi tiệt trùng" after "Sữa tươi 1L" from last month and watch the rebuy rule retire the old one.

## Exercises 7.1-7.3

Work in `src/`, read the doc comment above each function (it is the specification), and read the tests: they are examples of how your code is used. Check with `npm run check <id>`. Hints are one command away: `npm run learn -- hint <id>`.

### 7.1 Typed API client

One `request` helper that handles JSON, errors and 204. The `fetch` function is a parameter, so tests pass a fake.

* **Practice:** fetch, errors and dependency injection
* **Edit:** `src/client/api.ts`
* **Tests:** `tests/part7/api.test.ts`
* **Run:** `npm run check 7.1`

<details><summary>Hints</summary>

1. `response.ok` is false for 4xx and 5xx; fetch only rejects on network failure.
2. Call `response.json()` inside try/catch: an error page may not be JSON.

</details>

### 7.2 useItems hook

Load on mount, add after the server answers, move and remove optimistically and undo by reloading when the server says no.

* **Practice:** Effects, optimistic updates and rollback
* **Edit:** `src/client/useItems.ts`
* **Tests:** `tests/part7/useItems.test.tsx`
* **Run:** `npm run check 7.2`

<details><summary>Hints</summary>

1. Wrap functions in `useCallback` so their identity is stable.
2. A `cancelled` flag in the effect cleanup prevents updates after unmount.

</details>

### 7.3 Put it all together

Combine the hook and the components into the screen: loading and error states, spending, attention list, room, and the add-item form.

* **Practice:** Composition
* **Edit:** `src/client/App.tsx`
* **Tests:** `tests/part7/App.test.tsx`
* **Run:** `npm run check 7.3`

<details><summary>Hints</summary>

1. Hooks must run in the same order every render: call `useItems` and `useState` BEFORE any early return.
2. Derive `selected` from `selectedId` instead of storing the whole item.

</details>

## What your app can do now

The app works end to end in your browser, backed by your server.

```bash
npm run server   and   npm run dev   (open http://localhost:5173)
```

## Check yourself

Tick these with `npm run learn -- tick <id>` when you can honestly say yes.

- **7.m1** I added an item in the browser and found it in data/items.json
- **7.m2** I can explain optimistic updates and when to roll back
- **7.m3** I can explain why `fetch` does not throw on a 404
