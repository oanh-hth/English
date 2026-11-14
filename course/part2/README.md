# Part 2: Forms, state and talking to a server

**Goal.** The notes screen now loads from and saves to a server over HTTP. The server is a fake one (`json-server`) for now. In Part 3 you replace it with your own.

**You will learn:** effects, `fetch`, loading and error states, editing and deleting, a reusable bottom sheet, and TanStack Query for server state.

## a. Effects and fetching

A **side effect** is anything outside rendering: a network call, a timer, a subscription. In React you run effects in `useEffect`:

```tsx
const [notes, setNotes] = useState<Note[]>([]);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const ctrl = new AbortController();
  fetch('/api/notes', { signal: ctrl.signal })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<Note[]>; })
    .then(setNotes)
    .catch(e => { if (e.name !== 'AbortError') setError(String(e.message)); })
    .finally(() => setLoading(false));
  return () => ctrl.abort();           // cleanup: cancel if the component goes away
}, []);                                // [] = run once
```

Things that go wrong, and are exactly what interviews ask about: **forgetting the cleanup**, **stale responses overwriting new ones**, **no error state**, **no loading state**, **infinite loops** from missing or wrong dependency arrays.

**json-server** gives you a REST API from a JSON file, perfect for developing the front end first:

```bash
npm i -D json-server@0.17
# db.json: { "notes": [ ... ] }
npx json-server --port 3001 --watch db.json
```

In Vite, forward `/api` to it so the browser sees one origin (no CORS): in `vite.config.ts` set `server.proxy = { '/api': { target: 'http://localhost:3001', rewrite: p => p.replace(/^\/api/, '') } }`.

### Exercises

**2.1.** Create `db.json` from `sample-data/notes.json` (with `id`, `stage`, `due`), run json-server, and load the notes with `useEffect` and `fetch`. Show "Loading..." and an error message.

**2.2.** Stop json-server and check that your error state appears. Then start it again and add a **Retry** button.

**2.3.** Make adding a note `POST` to the server and add the **returned** note (with its server id) to state. Disable the submit button while the request is in flight.

**2.4.** Add **Delete** with a confirmation sheet (a `<dialog>` or a modal). Use the `DELETE` method, and remove the note from state only after the server confirms.

## b. Editing, sheets and bulk add

**Lifting state** gets awkward when many components need the same data. We will fix that with a library in lesson c. First practise the UI patterns.

A **bottom sheet** is a panel that slides up over the page. Build it once as a component with `open`, `onClose` and `children`. Use the native `<dialog>` element (`showModal()`) to get focus trapping and the Escape key for free. On iOS, remember to lock the page scroll while it is open.

**Bulk add** is a favourite feature: paste lines like `bummer = something disappointing | Oh, bummer, it is closed.` and get notes. Parsing is a pure function, so it gets tests:

```ts
parseBulk('bummer = disappointing | Oh bummer.\nwrap up')
// [{ text:'bummer', meaning:'disappointing', example:'Oh bummer.', kind:'word' },
//  { text:'wrap up', meaning:'', example:'', kind:'phrase' }]
```

A note is a `word` if its text has no space, otherwise a `phrase`.

### Exercises

**2.5.** Build a reusable `Sheet` component on `<dialog>`. Use it for the add form, so adding a note opens a sheet instead of a form on the page.

**2.6.** Add **Edit**: open the same form pre-filled; save with `PUT` (or `PATCH`). Update the list from the server's answer.

**2.7.** Write `parseBulk` in `src/bulk.ts` with at least six unit tests (empty lines, no meaning, a `|` but no `=`, extra spaces, `-` or `=` separators, a trailing newline).

**2.8.** Build the "Add many" sheet using `parseBulk`. Show "N notes ready" as the user types. Skip duplicates and report how many were skipped.

**2.9.** Add a toast message component ("Saved.", "Deleted.") that disappears after 3 seconds, with `role="status"` so screen readers announce it.

## c. TanStack Query: server state done right

Hand-written `useEffect` fetching repeats itself in every component and misses caching, retries, refetching and invalidation. **TanStack Query** manages **server state** for you.

```tsx
const qc = useQueryClient();
const notes = useQuery({ queryKey: ['notes'], queryFn: () => api.get<Note[]>('/notes') });

const add = useMutation({
  mutationFn: (n: NewNote) => api.post<Note>('/notes', n),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),   // refetch the list
});
```

- **Query keys** identify data: `['notes']`, `['notes', id]`, `['schedule']`.
- **Invalidation** says "this is stale, refetch it". After adding a note, the list and the schedule are both stale.
- Keep a thin `api.ts` wrapper over `fetch` that sets the base URL, JSON headers and throws on non-2xx. You will add the auth header there in Part 7.
- **Server state vs UI state.** Notes from the server live in the query cache. The search text, the open sheet and the form fields are UI state and stay in `useState`.

### Exercises

**2.10.** Install `@tanstack/react-query`, add `QueryClientProvider`, and replace the `useEffect` fetching with `useQuery`. Delete the loading and error state you wrote by hand and use `isPending` and `isError`.

**2.11.** Convert add, edit and delete to `useMutation` with invalidation. Show `isPending` on the buttons.

**2.12.** Create `src/api.ts` with `get`, `post`, `put` and `del` helpers that throw a typed `ApiError` (with `status` and `message`) on non-2xx.

**2.13.** Debounce the search box (300 ms) and send the query to the server as `GET /notes?q=...`. Put `q` in the query key. (json-server supports `?q=` full-text search.)

**2.14.** Add the Query Devtools in development only. Use them to watch a query go fresh, stale and refetching, and describe what you see in `NOTES.md`.

## Checkpoint 2

- [ ] The notes screen works end to end against json-server: list, search, add, add many, edit, delete.
- [ ] No component calls `fetch` directly, only `api.ts` through TanStack Query.
- [ ] `parseBulk` has tests, all passing.
- [ ] A network error shows a message and a retry, never a blank screen.

Tag it: `git tag part2`.

**Reference:** the reference app's `notebook.js` (sheet, search, bulk add) shows the same UI patterns with no libraries.
