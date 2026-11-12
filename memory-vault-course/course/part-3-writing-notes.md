# Part 3: Writing notes

The library shows your memories. Now you can **write about them**: open a photo, give it a title, a date, tags and a note, save it, or delete it.

Writing means the browser *sends data to the server*, and data from outside can never be trusted. So this part is about **validation**, about **changing** things with `PATCH` and `DELETE`, and about **forms** in React.

- [a) Never trust input](#a-never-trust-input)
- [b) Changing and deleting](#b-changing-and-deleting)
- [c) Forms in React](#c-forms-in-react)
- [Self-check](#self-check) · [Run the app](#run-the-app)

---

## a) Never trust input

Everything in a request body comes from the outside world, so it can be anything: a number where text is expected, a 10 MB title, a date that does not exist, or fields you never asked for. If you pass it straight to the database, you get crashes at best and security holes at worst.

The fix is to describe the allowed shape **once**, and check every request against it before any other code runs. We use [zod](https://zod.dev), a library of *schemas*:

```ts
import { z } from 'zod';

const schema = z.object({
  title: z.string().max(200).optional(),          // text, at most 200 characters, may be missing
  takenOn: z.string().refine(isValidDate, 'Date must be YYYY-MM-DD').optional(),
});

const result = schema.safeParse(body);
// { success: true, data: {...} }   or   { success: false, error }
```

Two details matter:

- Unknown fields are **dropped** by default. If someone sends `{ "title": "x", "isAdmin": true }`, only `title` comes out. That is exactly what we want.
- `.refine(fn, message)` adds your own rule. Our `isIsoDate` from part 1 is reused here. Your work is paying off: the same function validates dates in the browser tests and on the server.

Errors need a consistent shape. `server/src/http/errors.ts` (given) defines `HttpError(status, message)`. Throw it anywhere in a route and one error handler answers `{ "error": "..." }` with that status.

### Exercise 3.1: Validate requests

> **File:** `server/src/http/validation.ts` · **Test:** `npm run ex -- 3.1`
> **Builds:** the front door of the API.

For now, fill in `mediaPatchSchema` and `parseBody`. (The other three schemas in the file are placeholders, `z.any()`; you replace them in parts 4 and 5 when their routes appear.)

<details><summary>Hint: parseBody</summary>

`schema.safeParse(body ?? {})`. When `result.success` is false, `result.error.issues[0]?.message` is the first problem; throw `new HttpError(400, thatMessage)`. Otherwise return `result.data`.
</details>

---

## b) Changing and deleting

Two routes, `PATCH /api/media/:id` and `DELETE /api/media/:id`, in `server/src/http/routes/media.ts`. Each follows the same recipe you used for the library:

1. validate (`parseBody(mediaPatchSchema, req.body)`)
2. call the repository (`media.update(...)`, `media.remove(...)`)
3. answer (`{ ok: true }`, or a 404)

A few decisions worth noticing:

- **404 for "not yours".** If Bob asks for Alice's photo, the repository finds nothing (the query includes `user_id`) and the route answers `404 Not found`, exactly as for an id that never existed. Answering `403 Forbidden` would *confirm* the photo exists, which is information Bob should not get.
- **Delete the file too.** `media.remove` returns the deleted row precisely so the route can then call `storage.remove(row.storageKey)`. Forget that and your disk fills up with files nobody can see.
- **Partial updates.** `PATCH` changes only the fields you send. `PUT` would replace the whole thing. That is the difference between them.

### Exercise 3.2: Edit and delete routes

> **File:** `server/src/http/routes/media.ts` · **Test:** `npm run ex -- 3.2`

You will come back to the delete route in part 5, when deleting a photo can leave a series empty.

---

## c) Forms in React

Last part you built a component that *displays*. A form is a component that also *remembers what you typed*.

### Controlled inputs

```tsx
const [title, setTitle] = useState(initial.title);
<input value={title} onChange={(e) => setTitle(e.target.value)} />
```

The input always shows the state; every keystroke updates the state. React stays in charge, so you can validate, trim, or show the value somewhere else instantly.

Several fields can live in one state object. Update one without losing the others by copying:

```tsx
const [values, setValues] = useState(initial);
setValues({ ...values, title: e.target.value });
```

### Derived data is not state

The tag chips under the form are not state. They are *computed* from the `tags` text on every render:

```tsx
const tags = parseTags(values.tags);     // your function from exercise 1.1
```

Storing both would let them drift apart. A rule of thumb: **if you can compute it, do not store it.**

### Async handlers and honest feedback

Saving takes time and can fail, so the form keeps a small status: `idle`, `saving`, `saved`, `error`.

```tsx
async function handleSubmit(event: FormEvent) {
  event.preventDefault();          // stop the browser from reloading the page
  setStatus('saving');
  try {
    await onSave(values);
    setStatus('saved');
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Could not save');
    setStatus('error');
  }
}
```

The user should always know what is happening: the button says "Saving…" and is disabled, then "Saved ♥" appears, or a clear error.

### XSS: why text stays text

If a user writes `<img src=x onerror=stealEverything()>` as a tag and the app inserted it as HTML, the script would run in *every* browser that views the page (cross-site scripting, XSS). React escapes values in `{ }`, so the string is displayed, never executed. Your tests include exactly this attack. The one thing to never do: `dangerouslySetInnerHTML` with user text.

### Accessibility is also testability

Use real `<label>`s, `<button>`s and headings. Testing Library finds elements the way a person (or a screen reader) would, `getByLabelText('Title')`, `getByRole('button', { name: 'Save notes' })`, so accessible markup makes your tests easy to write.

### Exercise 3.3: Note editor

> **File:** `web/src/components/NoteEditor.tsx` · **Test:** `npm run ex -- 3.3`
> **Builds:** title, date, tags with live chips, notes, and "Saved ♥".

The component does not call the server: it receives an `onSave` function and awaits it. `App.tsx` (given) passes one that calls `PATCH`. Keeping the form ignorant of the network is what makes it so easy to test.

---

## Self-check

1. What happens to a field zod does not know about? Why is that useful?
2. Why answer `404` instead of `403` when someone asks for another user's photo?
3. What is the difference between `PATCH` and `PUT`?
4. Why are the tag chips computed on every render instead of kept in state?
5. How does React stop `<img onerror=...>` in a tag from running?
6. Why does the editor take `onSave` as a prop instead of calling `fetch` itself?

## Run the app

With both servers running (see part 2), open <http://localhost:5173> and click a photo. The note editor opens beside the picture. Write a title and a note, press **Save notes**, close the dialog, **reload the page**: your words are still there, because they went to the database. Delete a photo and check that its file disappears from `data/files`. Then try something the form would never let you do, and watch the server refuse it. (A browser date picker cannot produce 30 February, so use the command line.)

```bash
# pick any id from the list
curl -s http://127.0.0.1:3000/api/library | head -c 300
curl -s -X PATCH -H 'Content-Type: application/json' -d '{"takenOn":"2024-02-30"}' http://127.0.0.1:3000/api/media/PUT_AN_ID_HERE
# -> {"error":"Date must be YYYY-MM-DD"}
```

Tick the manual boxes in `CHECKLIST.md` and run `npm run progress`.

**Stretch:** reject a `takenOn` date in the future, on the server, and add a test.
