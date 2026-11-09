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
