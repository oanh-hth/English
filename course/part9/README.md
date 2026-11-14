# Part 9: Practice: sentences, voice and the daily mission

**Goal.** Three ways to use a word actively: write a sentence with it, say it out loud and compare, and use it for real today. Plus time zones done properly, and a full backup of the user's data.

**You will learn:** transactions across several tables, the browser's microphone API, idempotent endpoints, time zones, importing and exporting data safely.

## a. Write your own sentences

Recognising a word is easy. **Producing** it is what makes it yours. The exercise: five notes (due and weakest first), the learner writes a sentence with each, **then judges it themselves** (Natural, Not sure, Feels off). There is no AI scoring. The value is in the effort and the comparison.

Server side, one endpoint does several things at once, so it needs a **transaction**:

```ts
// POST /api/notes/:id/sentences  { body: string, rating: 'natural' | 'unsure' | 'off' }
await sequelize.transaction(async t => {
  const note = await findOwnedNote(id, userId, t, { lock: true });
  await Sentence.create({ noteId: note.id, body, rating }, { transaction: t });
  if (isDue(note, today)) await gradeNote(note, { natural: 2, unsure: 1, off: 0 }[rating], today, t);   // reuse the Part 5 code
  else if (rating === 'off') await slipNote(note, today, t);
  await awardPoints(userId, 'sentence', { natural: 6, unsure: 3, off: 1 }[rating], today, t);
  await water(userId, today, t);
});
```

Reuse the review logic from Part 5: do **not** copy it. Two copies of a rule drift apart.

On the client, the pure `used(text, note)` function from Part 1 tells the learner when they did not include the word, which is a gentle nudge, not a block (they may have used another form).

To choose the five notes in SQL: `ORDER BY (due <= :today) DESC, stage ASC, random() LIMIT 5`.

### Exercises

**9.1.** Add `POST /api/notes/:id/sentences` as above, with zod (`body` 3 to 300 characters). Return `404` for another user's note.

**9.2.** Add `GET /api/practice/sentences` returning five notes chosen with the SQL above (without `lock`).

**9.3.** Show the latest sentence on each note card, using one query for the whole list (`DISTINCT ON (note_id)` or a lateral join), not one query per note. Explain the **N+1 query problem** in `NOTES.md`.

**9.4.** Build the sentence round in React: write, **Done**, see your sentence (with a Hear button), your saved example, the three rating buttons, then the next note. Use a reducer.

**9.5.** Add the `used()` hint ("I can't find 'hang out' in your sentence") on the rating screen.

**9.6.** Add `POST /api/practice/rounds { mode, count }` for the finishing bonus (+10 sentences, +5 speaking). Validate `count <= 5`, and allow at most 10 bonuses a day. Explain in `NOTES.md` what a cheater could still do and why that is acceptable here.

## b. Say it out loud

The browser can record from the microphone with **`getUserMedia`** and **`MediaRecorder`**, entirely on the device:

```ts
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });   // asks permission
const rec = new MediaRecorder(stream);
const chunks: Blob[] = [];
rec.ondataavailable = e => e.data.size && chunks.push(e.data);
rec.onstop = () => {
  stream.getTracks().forEach(t => t.stop());                    // release the microphone (the red dot)
  setUrl(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType })));
};
rec.start();
```

Things that bite:

- It needs **HTTPS** (or `localhost`) and a **user gesture**. On iPhone and iPad the first request shows a system prompt.
- Different browsers record different formats. Safari uses `audio/mp4`. Use `rec.mimeType` and never hard-code one.
- **Release** the stream (`track.stop()`) and **revoke** object URLs (`URL.revokeObjectURL`) or the microphone stays on and memory leaks.
- **Permission can be denied or unavailable.** The exercise must still work: say it, rate yourself.
- **Privacy:** the recording **never leaves the device**. No upload, no storage. Say so on the screen.

Wrap this in a `useRecorder()` hook returning `{ state, url, start, stop, reset, error }`. Hooks are how React shares behaviour that has state and cleanup.

### Exercises

**9.7.** Write `useRecorder` with states `idle | recording | ready | unsupported`, with full cleanup when the component unmounts.

**9.8.** Build the speaking screen: the phrase, **Listen** and **Slower** (Part 1's `speak`), a big record button that pulses while recording, **Play mine**, **Play model**, **Try again**.

**9.9.** Add the two rating buttons (Sounded good, Needs work) and `POST /api/notes/:id/speak { rating }` awarding 4 or 1 points, at most 20 spoken answers a day.

**9.10.** Show a friendly message when the microphone is denied, and allow rating anyway.

**9.11.** Add a link to YouGlish for the phrase, and a note that recordings are never saved.

**9.12.** Test on a real iPhone or iPad and write down what you learned in `NOTES.md` (permission prompt, format, speaker routing).

## c. Daily mission, time zones, export and import

**Use it today.** Each day the app picks one of your notes with a small real-life mission ("use it in a message to a friend"). The pick must be the **same all day** and must exist once per user per day. Create it **lazily**: the first `GET /api/mission` of the day inserts it, safely, even with two simultaneous requests:

```sql
INSERT INTO missions (user_id, day, note_id) VALUES (:userId, :day, :noteId)
ON CONFLICT (user_id, day) DO NOTHING;
SELECT * FROM missions WHERE user_id = :userId AND day = :day;
```

**Idempotency.** Completing a mission twice must pay once. Make the update itself the guard:

```sql
UPDATE missions SET done = true WHERE user_id = :userId AND day = :day AND done = false RETURNING note_id;
```

If it returns a row, pay the points and record the `uses` row. If it returns nothing, it was already done. No "check first, then write".

**What day is it?** Until now the client sent its date. That is fragile (clocks, travel, cheating). Store each user's **IANA time zone** (`Asia/Ho_Chi_Minh`, `America/Chicago`) and compute their "today" on the server:

```ts
export const todayFor = (tz: string, now = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);   // 'YYYY-MM-DD'
```

`en-CA` happens to format dates as `YYYY-MM-DD`. Validate the zone before saving it. An invalid name makes `Intl` throw. Pass `now` in as a parameter so tests can control time without fake timers.

**Export and import.** Users own their data. `GET /api/export` returns everything of theirs as JSON. `POST /api/import` restores it. Import is dangerous: **validate everything with zod**, run it in **one transaction**, and **never trust ids** from the file: create new rows and remap the foreign keys (old note id to new note id).

### Exercises

**9.13.** Implement `GET /api/mission` (lazy, deterministic: the note is `candidates[hash(userId + day) % n]` from the 8 weakest due-first notes) with the `ON CONFLICT` insert. Return `204` when the user has no notes.

**9.14.** `POST /api/mission/swap` replaces the note with a different random one, only while the mission is not done.

**9.15.** `POST /api/mission/done { where? }` with the guarded `UPDATE`. Insert a `uses` row if `where` was given, award 10 points, water the plant. Prove idempotency with a test that fires it five times at once.

**9.16.** Add a `timezone` column (migration), validated on write, defaulting to `UTC`. Write `todayFor` with unit tests including a user in `Pacific/Auckland` whose "today" is already tomorrow in UTC.

**9.17.** Replace the `X-Day` header from Part 5 everywhere: the server derives today from the user's zone. The client sends its zone once at sign-up and after login if it changed.

**9.18.** Write a test for the awkward hour: server time `2026-11-14T23:30:00Z` for a user in `Asia/Ho_Chi_Minh` is already `2026-11-15`. Which notes are due? Which `water` day is recorded?

**9.19.** Write `GET /api/export` (notes with their reviews, sentences and uses; plants; point events; missions).

**9.20.** Write `POST /api/import` with a zod schema, a size limit and a single transaction. Remap ids. A file that is half valid changes nothing.

**9.21.** Build the Me screen buttons: **Export backup** (download a `.json` file) and **Import backup** (file picker, then a confirmation sheet showing counts: "This backup has 120 notes. It replaces your current data.").

**9.22.** Round-trip test: create data, export, delete the account, sign up again, import, export again. The two exports must match apart from ids and timestamps.

## Checkpoint 9

- [ ] The sentence round, the speaking round and the daily mission all work, award points and feed the review schedule.
- [ ] Completing a mission twice, or watering twice, never double-pays, even with simultaneous requests.
- [ ] "Today" comes from the user's time zone on the server, with tests for midnight edge cases.
- [ ] Export and import round-trip without losing or duplicating anything.
- [ ] The microphone is released after use and recordings never leave the device.

Tag it: `git tag part9`.

**Reference:** `practice.js` at the repository root.
