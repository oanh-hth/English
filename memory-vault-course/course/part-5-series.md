# Part 5: Series (albums)

A holiday is not one photo, it is thirty. In this part you add **series**: an ordered group of photos with one shared note and a cover. You upload several files as one series, flip through them with the arrow keys, reorder them, change the cover, and take photos out.

This is the most rule-heavy part of the course, and it teaches you how to keep rules safe when many things change at once: **data modelling**, **transactions**, and **state that is a list**.

- [a) Modelling a series](#a-modelling-a-series)
- [b) Transactions and tidying up](#b-transactions-and-tidying-up)
- [c) The series routes](#c-the-series-routes)
- [d) Lists in React state](#d-lists-in-react-state)
- [e) Effects: the keyboard](#e-effects-the-keyboard)
- [Self-check](#self-check) · [Run the app](#run-the-app)

---

## a) Modelling a series

Look at the two tables in `server/src/db/schema.ts`:

```
series:  id, title, note, tags, taken_on, cover_id
media:   id, ..., series_id, position
```

A series has **many** photos; each photo belongs to **at most one** series. That is a *one-to-many* relationship, stored on the "many" side: each photo points to its series with `series_id`, and says where it stands with `position` (0, 1, 2...). A loose photo has `series_id = NULL`. There is no separate list of photos stored in the series: the order *is* the `position` numbers.

Rules that must always hold (we call them **invariants**):

1. A series has at least one photo. A series with none must not exist.
2. A series' cover is one of its own photos. If the cover leaves, the first remaining photo takes over.
3. Positions follow the order the user chose.
4. A user can only put **their own, ready** photos into a series.

If these rules lived in the routes, every route would have to remember them, and one would eventually forget. So the rules live in one place, the **repository**, and the tests attack them one by one.

(`list` and `get` in `SeriesRepo` are given because the library page already needed them in part 2. Read them as a model.)

## b) Transactions and tidying up

Creating a series changes two tables: insert the series row **and** point the photos at it. If the server crashes between the two, you have a series without photos, or photos pointing at nothing. A **transaction** groups statements so that either *all* happen or *none*:

```ts
db.exec('BEGIN');
try {
  /* several statements */
  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');     // undo everything since BEGIN
  throw error;
}
```

Put this in a small private helper (`tx(fn)`) and use it for every operation that changes more than one row.

The second tool is **tidy-up**. After any change that moves photos around, one method repairs the invariants: delete series with no photos, and fix covers that point at a photo that left. Having one `tidy(userId)` that every mutation calls is far safer than trying to remember each rule at each place.

SQL you will want:

```sql
UPDATE media SET series_id = NULL WHERE series_id = ? AND id NOT IN (?, ?, ?);   -- photos that left
UPDATE media SET series_id = ?, position = ? WHERE id = ? AND user_id = ?;       -- place one photo
DELETE FROM series WHERE id NOT IN (SELECT DISTINCT series_id FROM media WHERE series_id IS NOT NULL);
```

`NOT IN (?, ?, ?)` needs one `?` per id: you *generate the marks* (`ids.map(() => '?').join(',')`), never the values. That keeps you safe from SQL injection.

### Exercise 5.1: Series repository

> **File:** `server/src/db/seriesRepo.ts` · **Test:** `npm run ex -- 5.1`

Suggested order: a private `tx`, a private check that an id list is valid (`INVALID_IDS` otherwise), `setItems`, then `tidy`, `create`, `update`, `removeWithItems`. Read the test names: they are the rules above.

<details><summary>Hint: update with an `ids` list</summary>

Three cases: `ids` is `undefined` (leave the photos alone), `ids` is `[]` (dissolve: all photos become loose and `tidy` deletes the series), or a normal list (validate it, release photos that are not in it, place the others by index). Always run `tidy` at the end, inside the same transaction.
</details>

---

## c) The series routes

Same recipe as in part 3: validate, call the repository, answer. Two new details:

- The repository signals a bad id list by throwing `Error('INVALID_IDS')`. The route turns that one error into a `400` with a friendly message and lets every other error continue. A tiny helper that wraps a call in `try/catch` keeps the routes readable.
- Deleting a *photo* can now empty a series. The delete route from part 3 must call `series.tidy(userId)` after removing the row. Going back to old code to honour a new rule is a normal part of building software.

### Exercise 5.2: Series routes

> **Files:** `server/src/http/routes/series.ts`, `media.ts` (add the tidy call), `validation.ts` (the two series schemas) · **Test:** `npm run ex -- 5.2`
> **Builds:** `POST /api/series`, `PATCH /api/series/:id`, `DELETE /api/series/:id`.

---

## d) Lists in React state

The upload panel needs a mode (one series, or separate items), a title, a date, and an **ordered list of files** the user can rearrange with arrows.

Rule number one of React state: **never change it in place**. Make a new array and set that:

```tsx
const [order, setOrder] = useState(files);

function move(index: number, direction: -1 | 1) {
  const next = [...order];                                       // a copy
  [next[index], next[index + direction]] = [next[index + direction], next[index]];   // swap
  setOrder(next);                                                // React sees a new array and re-renders
}
```

Also use **conditional rendering** to show a part of the form only sometimes: `{mode === 'series' && <input ... />}`.

### Exercise 5.3: Upload panel, series mode

> **File:** `web/src/components/UploadPanel.tsx` (the same file as 4.4) · **Test:** `npm run ex -- 5.3`

Extend your component. The comment lists everything: radio buttons when there are several files, a title and date, move buttons, and the plan sent to `onSubmit`. `App.tsx` (given) already turns a `'series'` plan into `POST /api/series` after the uploads.

---

## e) Effects: the keyboard

The series reader changes with **arrow keys**. Pressing a key is something that happens *outside* React, so we connect to it with an **effect**:

```tsx
useEffect(() => {
  function onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, last));
  }
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);   // cleanup!
}, [last]);
```

The function you return is the **cleanup**. Without it, every time the component re-renders you would add *another* listener, and a closed reader would keep answering the keyboard. The array at the end (`[last]`) lists the values the effect uses; React re-runs it when they change. Read [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects).

Another detail: the parent may send a *shorter* `photos` list after you remove one, so never read `photos[index]` without first **clamping** the index into range: `Math.max(0, Math.min(index, photos.length - 1))`.

### Exercise 5.4: Series reader

> **File:** `web/src/components/SeriesReader.tsx` · **Test:** `npm run ex -- 5.4`
> **Builds:** flip through a series, move photos, set the cover, remove, close.

Your component does not save anything. It calls `onMove`, `onSetCover` and `onRemove`, and the parent (given) sends the changes to the server and passes new `photos` back. Notice how "move later" also moves the index with the photo, so the reader keeps showing the same picture.

---

## Self-check

1. Where is the order of a series stored? Why not store a list of ids in the `series` row?
2. Name two invariants of a series. Which method repairs them?
3. What goes wrong without a transaction in `create`?
4. Why does the series route change the delete-photo route from part 3?
5. Why copy an array before changing it in React state?
6. What does the cleanup function of an effect prevent?

## Run the app

Upload three photos at once. In the panel, leave **One series** selected, type a title, put the files in the order you want with the arrows, and press **Create series**. A stack appears. Open it and:

- flip with the buttons and with the **← →** keys,
- **Move later**, **Set as cover**, then close and check the stack shows the new cover,
- **Remove from series** on every photo: when the last one leaves, the stack disappears (invariant 1),
- remove one photo from the series, open it as a loose item and **Delete** it: its file disappears from `data/files`, and the stack count is one lower.

Tick the manual boxes and run `npm run progress`. **Stretch:** show each photo's own title and note under the picture in the series reader.
