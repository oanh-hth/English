# Phase 3: Data with SQLite

**Goal:** model data in tables, write safe SQL, and keep the app's rules (ownership, order, covers) inside *repositories*.
**You build:** the media repository and the series repository.
**Time:** about 3 to 5 hours.

## Learn first

### 1. Tables, rows, columns
Open `server/src/db/schema.ts` (given). `media` has one row per photo or video. `series` has one row per series, and each photo points to it with `series_id` and `position`. SQLite keeps everything in one file; Node has it built in. Docs: https://nodejs.org/api/sqlite.html

### 2. The four SQL statements you need
```sql
INSERT INTO media (id, user_id, ...) VALUES (?, ?, ...);
SELECT * FROM media WHERE user_id = ? AND status = 'ready' ORDER BY position, created_at;
UPDATE media SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?;
DELETE FROM media WHERE id = ? AND user_id = ?;
```
In Node: `db.prepare(sql).run(...values)`, `.get(...)` for one row, `.all(...)` for many.

### 3. NEVER paste values into SQL text
Always use `?` placeholders. Building `"... WHERE id = '" + id + "'"` allows **SQL injection**: someone sends an id such as `' OR 1=1 --` and reads everything. Placeholders make that impossible.
(The only time you build SQL text yourself is a list of `?` marks, like `IN (?, ?, ?)`: you generate the *marks*, never the values.)

### 4. Ownership: every query checks `user_id`
`WHERE id = ? AND user_id = ?` is what stops Alice reading Bob's photo even if she guesses his id. Tests in this phase try exactly that.

### 5. Repositories
A repository is a class that owns the SQL for one kind of thing. Routes call `media.update(id, userId, patch)` and never see SQL. This keeps rules in one place and makes them testable with an in-memory database (`:memory:`).

### 6. snake_case vs camelCase
SQL columns look like `taken_on`; TypeScript fields look like `takenOn`. The repository converts at the boundary (`toItem(row)`).

### 7. Transactions
Several changes that must happen together (create a series AND move its photos) go in a transaction: `BEGIN`, then `COMMIT`, or `ROLLBACK` if anything throws. Without it, a failure half-way leaves broken data.

### 8. Keeping invariants
"A series with no photos must not exist" is an *invariant*. The `tidy()` method repairs it after any change, and tests check it.

## Self-check
1. What is SQL injection, and what exactly prevents it here?
2. Why does `findReady` filter on `status = 'ready'`?
3. What would go wrong without a transaction in `SeriesRepo.create`?
4. Why does `MediaRepo.remove` return the deleted row instead of `true`?
5. Why is `MediaItem` (public) different from `MediaRow` (private)? What must never reach the browser?

## Exercises
Tests use `server/test-support/db.ts` (given) to insert rows with plain SQL, so these two exercises do not depend on each other.

### 3.1 Media repository  (`server/src/db/mediaRepo.ts`)
**Builds:** saving and listing photo records, per user, with pending and ready states.
Write a `toItem(row)` helper and reuse it. For `update`, read the current row, merge with `patch` using `??`, and write all fields back.

### 3.2 Series repository  (`server/src/db/seriesRepo.ts`)
**Builds:** series with order, cover and automatic tidy-up. The most rule-heavy exercise of the course.
Suggested order: `create` (with a private `assertUsable` and `setItems`), `get`/`list`, `tidy`, `update`, `removeWithItems`.
<details><summary>Hint: setItems</summary>

1. Release photos that are in the series but not in the new list: `UPDATE media SET series_id = NULL WHERE series_id = ? AND id NOT IN (?, ?, ...)`.
2. Then, for each id with its index, `UPDATE media SET series_id = ?, position = ? WHERE id = ? AND user_id = ?`.
</details>
<details><summary>Hint: tidy</summary>

Delete series whose id is not in `SELECT DISTINCT series_id FROM media WHERE series_id IS NOT NULL`. Then fix covers with `UPDATE series SET cover_id = (SELECT id FROM media WHERE series_id = series.id ORDER BY position LIMIT 1) WHERE cover_id IS NULL OR cover_id NOT IN (SELECT id FROM media WHERE series_id = series.id)`.
</details>

## Finished the phase?
`npm run progress`, tick the manual boxes. **Stretch:** add a `search(userId, text)` method to `MediaRepo` using `LIKE ?` with `%text%`, escaping `%` and `_`.
