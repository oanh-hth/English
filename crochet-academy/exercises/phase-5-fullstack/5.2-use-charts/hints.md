## Hint 1
One `useState` holding `{ status, charts, error }` keeps related values changing together. Start it as `{ status: 'loading', charts: [], error: null }`.

## Hint 2
`const mounted = useRef(true); useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);` then check `mounted.current` before every `setState` that happens after an `await`.

## Hint 3
`refresh = useCallback(async () => { ... }, [api])` and `useEffect(() => { void refresh(); }, [refresh])`. For `create`: `await api.create(input)` first, *then* `setState((s) => ({ ...s, charts: [chart, ...s.charts] }))`, so a failure throws before the state changes.
