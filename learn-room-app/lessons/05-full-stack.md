# Phase 5: Full stack

**You will build:** the client for your own API, a hook that keeps the screen and the server in sync (with optimistic updates), and the `App` that ties everything together. At the end the app runs in your browser.

## 1. A typed API client

`fetch` does **not** reject on 404 or 500. It only rejects when the network fails. You must check `response.ok` yourself:

```ts
const response = await fetchImpl(url, init);
if (!response.ok) throw new ApiError(response.status, message);
```

The error body may not be JSON (a proxy's HTML page), so parse it in `try/catch` and fall back to `HTTP 502`. A `204` has no body: do not call `json()`.

`fetchImpl` is a **parameter**. In the browser you pass the real `fetch`; in tests a fake that returns a `Response`. No network, no mock library.

## 2. Effects

`useEffect(() => { load(); return () => { cancelled = true } }, [api])` runs after render. The returned **cleanup** runs before the next effect and on unmount: set a `cancelled` flag so a slow response cannot update a component that is gone.

Rules of hooks: call them at the top level, in the same order every render, never after an early `return`.

`useCallback` keeps a function's identity stable between renders so effects and memoised children that depend on it do not re-run.

## 3. Optimistic updates

Dragging an item should feel instant. So:

1. Dispatch the change locally **now**.
2. Send it to the server.
3. If the server says no, **roll back**: reload the real state and show the error.

Adding an item is *not* optimistic because the server decides the id and whether the rebuy rule retired something.

## 4. Composition

`App` takes `api` and `today` as props (again: injection). It owns the small bits of UI state (`selectedId`, `addError`), asks `useItems` for the data and passes it down. It contains almost no logic: the logic is in the domain, the hook and the components you already tested.

## 5. Run it

```bash
npm run server     # terminal 1: API on http://localhost:3001, data in data/items.json
npm run dev        # terminal 2: React app on http://localhost:5173 (forwards /api to the server)
```

Add a few items. Add "Sữa tươi tiệt trùng" after "Sữa tươi 1L" from last month and watch the rebuy rule retire the old one.

## Exercises

| | |
|---|---|
| 5.1 | `createApiClient` (`src/client/api.ts`) |
| 5.2 | `useItems` (`src/client/useItems.ts`) |
| 5.3 | `App` (`src/client/App.tsx`) |

## Where to go from here (extra, no tests provided)

- Drag to move: use `pointToPercent` in `Room` with pointer events and call `move`.
- Bill import: a text area that calls `api.parseBill`, a preview table and a button that adds the rows.
- Replace `data/items.json` with SQLite.
- Add the Miso and Misu characters' reactions (a function of `compareSpending`, `needsAttention` and `dormantList`).
- Write the missing tests for what you add first, then the code.

## Check yourself

1. Why does `fetch` not throw on a 404?
2. When is an update optimistic and when must it wait for the server?
3. Why is there a `cancelled` flag in the effect?
4. What do you gain by passing `api` and `today` into `App`?
