# 5b · Data hooks

The charts page needs to load a list, show "loading" while it waits, show an error if it fails, and update after you create or delete one. That is behaviour with state, and several components could want it. React packages such things as a **custom hook**.

## What a hook is
A hook is a function whose name starts with `use` and that may call other hooks (`useState`, `useEffect`, ...). It lets you share *stateful logic* between components without sharing markup. `useCharts(api)` owns "the list of charts on the server": components just call it and render what it returns.

## State as a state machine
Think about what the page can be showing: *loading*, *ready* (with a list), or *error* (with a message). Do not model that as three booleans (`isLoading`, `hasError`, `hasData`), because they can contradict each other: loading and error at once? Instead, one value with a limited set of options:

```ts
status: 'loading' | 'ready' | 'error'
```
Impossible combinations cannot be represented, so they cannot occur.

## `useEffect`: do something when the component appears
```ts
useEffect(() => {
  void refresh();
}, [refresh]);
```
An **effect** runs after render. The array lists what it **depends on**: it runs again when one of those values changes. Loading data on mount is the classic use.

## Three rules that prevent most hook bugs
1. **Clean up.** A request can finish *after* the component has left the screen. Updating state then is wasted at best and a warning at worst. Keep a `mounted` ref that is set to `false` in the effect's cleanup function, and check it before each `setState` that follows an `await`.
2. **Stable dependencies.** If a dependency is a *new object on every render* (for example `useCharts(createApi())` creating a new client each time), the effect sees a change, runs, sets state, re-renders, creates another new object... an endless loop. Create such things **once**: `useMemo`, or outside the component. The same rule explains why the functions the hook returns are wrapped in `useCallback`: they keep the same identity between renders unless `api` changes.
3. **Update after success.** In `create`, first `await api.create(input)`; only then update the list. If the server says no, the call throws before any state changes, so the list stays correct and the *caller* can show the error. Never pretend something worked before you know.

## Testing a hook
`renderHook` from Testing Library runs a hook inside a throwaway component:
```ts
const { result } = renderHook(() => useCharts(api));
await waitFor(() => expect(result.current.status).toBe('ready'));
```
`result.current` is always the latest value the hook returned, and `act(...)` wraps the actions that change state. The `api` is a fake built with `vi.fn()`: no network, no server. Notice that the test builds the fake **once**, outside the callback; building it inside would trigger rule 2.

## What the app can do now
With 5.1 and 5.2 green, **reload the page**: the note about saving in the browser is gone, and the chart list now comes from your server. (The app switches once, at load, so reload after finishing.) Stop the server and reload to see the error state; start it again and press *Try again*.

## Exercises 5.2.

| | | file you edit |
|---|---|---|
| **5.2** [A data hook](../../exercises/part5-fullstack/5.2-use-charts/README.md) | custom hooks, effects, `useCallback` | `src/client/hooks/useCharts.ts` |

Next: [5c · Algorithms and photos](c-algorithms-and-photos.md).
