# Part 6d: Saving data on the server

*[Part 6: A Node.js server](README.md) · section d*

The server keeps each person's whole app state in a file. Simple, easy to back up, and plenty for a personal app. In this section you write that storage safely, and the API the app syncs with.

## Files with `fs/promises`

```ts
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
const text = await readFile(file, "utf8");
await writeFile(file, JSON.stringify(data));
```

A missing file throws an error with `code === "ENOENT"`. For "nothing saved yet", that's normal: return `null`. Any other error is a real problem: throw it.

## Atomic writes

If the server crashes halfway through `writeFile`, the file is left half-written and your data is broken. The fix: write to a temporary file, then **rename** it over the real one. A rename on the same disk is atomic: afterwards the file is either the old version or the new one, never half of each.

## Never trust input in a file path

The file name comes from the user id. If an id were `"../../evil"`, `path.join` would happily point outside your data folder. Keep only safe characters (letters, digits, `-`, `_`), and refuse what's left if it's empty. The tests try exactly this attack.

## Two devices, one file: conflicts

Your iPad and computer both save. What if the computer saves an old copy over the iPad's newer work? Each save says which version it was based on (`baseSavedAt`). If the stored copy is **newer** than that, someone else saved in between, and the server answers **409 Conflict** with the current copy instead of overwriting it. This is **optimistic concurrency**: assume no conflict, but check. The app then asks you which copy to keep (Part 7).

## The state API

```
GET /api/state          -> { state, savedAt }    (state null and savedAt 0 when nothing is saved)
PUT /api/state          { state, savedAt, baseSavedAt } -> { ok: true }  or 409
```

Both sit behind `requireAuth`, so `res.locals.userId` says whose file to use.

## Read more
- Node file system: <https://nodejs.org/api/fs.html#promises-api>
- Path traversal (OWASP): <https://owasp.org/www-community/attacks/Path_Traversal>
- Optimistic concurrency (Wikipedia): <https://en.wikipedia.org/wiki/Optimistic_concurrency_control>

---

## Exercises 6.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 6.4: Atomic file storage and the state API

**Edit:** `app/server/src/storage/fileStore.ts` · **Tests:** `tests/part-6/6.4-file-store.test.ts` · **Run:** `npm run ex 6.4`

Write `createFileStore(dir)` (one safe file per user, atomic writes, conflict check) and `stateRouter(store)`. After this, the app's data is saved on the server: look in `data/state/` after using the app.

---

[← 6c Accounts and protected routes](c-accounts.md) · [Part 7: Full stack and shipping →](../part-7/README.md)
