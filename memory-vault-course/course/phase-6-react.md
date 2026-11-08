# Phase 6: React with TypeScript

**Goal:** build the interface from typed components: props, state, effects, forms, keyboard handling, and tests with Testing Library.
**You build:** API client, login form, note editor, library view, upload panel and series reader. `App.tsx` (given) wires them together.
**Time:** about 5 to 8 hours.

## Learn first

### 1. Components are functions that return UI
```tsx
function Greeting({ name }: { name: string }) { return <h1>Hello {name}</h1>; }
```
JSX looks like HTML but is JavaScript. `{ }` inserts a value. React **escapes** inserted text, so a title like `<img onerror=...>` shows as text and cannot run. Never use `dangerouslySetInnerHTML` for user text.
Read: [react.dev/learn](https://react.dev/learn) (Describing the UI, Adding Interactivity).

### 2. Props, typed
Props are a component's inputs. In TypeScript, declare them: `interface LibraryProps { library: Library; onOpenItem: (id: string) => void }`. Functions as props (callbacks) are how a child tells its parent something happened.

### 3. State
`const [query, setQuery] = useState('')` remembers a value between renders. Changing it re-renders. A **controlled input** shows a state value and updates it in `onChange`. Do not store what you can compute (tag chips are computed from the `tags` text each time).

### 4. Rendering lists and conditions
`{items.map((i) => <li key={i.id}>{i.name}</li>)}` needs a stable `key`. `{error && <p role="alert">{error}</p>}` shows something only sometimes.

### 5. Effects
`useEffect(() => { ...; return () => cleanup; }, [deps])` synchronises with the outside world (keyboard, timers, network). **Always clean up** what you start. Read: [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects).

### 6. Async in components
Event handlers can be `async`. Keep UI state for "busy" and "error" (`Signing in…`, `role="alert"`) so users always know what happened.

### 7. Accessible by design
Use real `<button>`, `<label>`, headings, and ARIA only when needed (`role="alert"`, `aria-label`). It helps screen-reader users **and** your tests: Testing Library finds things the way a person would.

### 8. Testing components
```tsx
render(<LoginForm onSubmit={fn} />);
await userEvent.type(screen.getByLabelText('Username'), 'alice');
await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
expect(fn).toHaveBeenCalledWith('alice', '...');
```
Query by role/label/text, not by CSS class. Docs: https://testing-library.com/docs/react-testing-library/intro/ and https://testing-library.com/docs/queries/about

### 9. The API client
One place that knows about `fetch`, JSON, the CSRF header and error shapes keeps components clean, and lets tests give a fake `fetch`.

## Self-check
1. What re-renders a component? Does changing a normal variable?
2. Why does `Library` compute entries with `buildEntries` instead of storing them in state?
3. What would happen without the cleanup function in `SeriesReader`'s keyboard effect?
4. Why are tiles `<button>`s and not `<div onClick>`?
5. Why does the test use `getByRole('button', { name: 'Sign in' })` rather than a class name?

## Exercises
Use the component stubs' comments as the spec; the tests are the proof. Styles already exist (`web/src/styles.css`), so use the class names the comments suggest and your UI will look right. When all six are green, read `web/src/App.tsx` (given) and run the real app (phase 7).

### 6.1 API client  (`web/src/api/client.ts`)
**Builds:** the one place that talks to the server. No React in this one: it is plain TypeScript with a fake `fetch` in tests.

### 6.2 Login form  (`web/src/components/LoginForm.tsx`)
**Builds:** the sign-in screen with busy and error states.

### 6.3 Note editor  (`web/src/components/NoteEditor.tsx`)
**Builds:** where you write down a memory: title, date, tags (with live chips), notes, "Saved ♥".

### 6.4 Library view  (`web/src/components/Library.tsx`)
**Builds:** the scrapbook page. Uses `buildEntries` and `groupByYear` from phase 1, so your 1.3 work finally appears on screen.

### 6.5 Upload panel  (`web/src/components/UploadPanel.tsx`)
**Builds:** pick many files, order them, make a series. State holding an array that you reorder immutably.
<details><summary>Hint: swapping two items without changing the original</summary>

`const next = [...order]; [next[i], next[j]] = [next[j], next[i]]; setOrder(next);`
</details>

### 6.6 Series reader  (`web/src/components/SeriesReader.tsx`)
**Builds:** flip through a series with buttons and arrow keys, reorder, set the cover, remove. Keyboard effect with cleanup, and index clamping.

## Finished the phase?
`npm run progress`, tick the manual boxes. **Stretch:** show per-photo captions in `SeriesReader` (the data already has `title` and `note` for each photo).
