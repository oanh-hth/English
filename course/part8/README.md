# Part 8: The garden: points, growth and weather

**Goal.** Studying earns points, points grow a plant that you can see, and the garden sits under the real sky outside.

**You will learn:** the ledger pattern in a real transaction, idempotent writes with `ON CONFLICT`, anti-cheating on a server, drawing with SVG from data, CSS animation, caching an upstream API in the database.

## a. The growth engine, tests green

The rules are in [`app-spec.md`](../app-spec.md) under *Points and growth*. As in Part 5, start with **pure functions** and tests, then connect them to the database.

```bash
cd course/exercises && npm test     # growth.test.ts: 13 tests, failing
```

Open `src/growth.ts` and implement, in order: `stageOf`, `addPoints`, `plantSeed`, `isThirsty`, `weekStrip`. These functions are the **specification of behaviour**. The database will implement the same behaviour with rows instead of numbers, and you will check that they agree.

**In the database, growth is a ledger** (Part 4): a plant's growth is `SUM(points)` over its `point_events`. The server writes events and never edits a total. Capped growth is `LEAST(need, SUM(...))`. Points earned past the cap stay on the plant in the ledger. When you **harvest**, compute the leftover (`SUM - need`) and write it as a `bonus` event with `plant_id = NULL`, which is the "bank" for the next seed.

**One service function** records points, so the rules live in one place:

```ts
export async function awardPoints(userId: number, source: Source, points: number, day: string, t: Transaction) {
  const plant = await Plant.findOne({ where: { userId, harvestedOn: null }, transaction: t });
  await PointEvent.create({ userId, plantId: plant?.id ?? null, day, source, points }, { transaction: t });
}
```

**The daily drink** must happen once a day, even if two requests arrive together. Let the **unique partial index** decide:

```ts
const [, inserted] = await sequelize.query(
  `INSERT INTO point_events (user_id, plant_id, day, source, points)
   VALUES (:userId, :plantId, :day, 'water', 20)
   ON CONFLICT (user_id, day) WHERE source = 'water' DO NOTHING`,
  { replacements: {...}, transaction: t });
```

(Check the affected row count to know whether you watered or the day was already done.)

**The server is the referee.** A client that says "give me 500 points" is trying to cheat. There is **no endpoint that accepts a points value**. Each action computes its own points: grading a review earns 0 / 2 / 4 / 6, a Natural sentence earns 6, and so on. Add simple **anti-farming rules**: review points only when the note was actually due; note-creation points cap at 25 a day; the mission pays once a day.

### Exercises

**8.1.** Implement `stageOf` in `exercises/src/growth.ts`.

**8.2.** Implement `addPoints` (bank when no plant, cap at need, overflow to bank, `becameRipe` exactly once).

**8.3.** Implement `plantSeed`.

**8.4.** Implement `isThirsty`.

**8.5.** Implement `weekStrip`. All 13 growth tests pass. Copy `growth.ts` into `backend/src` (and the front end).

**8.6.** Write `awardPoints` as above and the `water(userId, day, t)` function using `ON CONFLICT DO NOTHING`. Call `water` from every learning action (adding a note, grading a review). Test by firing 10 simultaneous requests: exactly one `water` row must exist.

**8.7.** Give points inside your existing endpoints (note created +5 up to 25 a day, review +0/2/4/6 only if due, session bonus +10 once per finished session). Verify with `psql` that no route accepts a points number from the client.

**8.8.** Build `GET /api/garden` (the current plant, its `growth`, `need`, `stage`, `t`, the bank, `thirsty`, `week`, the collection), `POST /api/garden/plant { type }` (a transaction: insert the plant, move banked events onto it) and `POST /api/garden/harvest` (only when ripe; set `harvested_on`; write the leftover as a banked `bonus`). Write a test replaying a list of events through `addPoints` and comparing with what the endpoint reports.

## b. Drawing plants

The plant is an **SVG**, drawn by a function of `(type, t)` where `t` runs from 0 (seed) to 1 (ripe). Because it is a pure function of its inputs it is easy to test visually: render it at `t = 0, .25, .5, .75, 1` and look.

```tsx
type PlantProps = { type: PlantType; t: number; thirsty?: boolean };
export function Plant({ type, t, thirsty }: PlantProps) {
  return (
    <svg viewBox="0 -40 200 280" className={thirsty ? 'plant thirsty' : 'plant'} role="img" aria-label={type}>
      <Soil />
      <g className="sway">{type === 'tomato' ? <Tomato t={t} /> : null}</g>
    </svg>
  );
}
```

A few helpers do most of the work. A **leaf** is a rotated shape at a point; **`seg(t, a, b)`** gives a 0..1 progress for the part of the growth between `a` and `b`, so leaves, flowers and fruit appear at the right time:

```ts
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
// fruit appears from t = .55 and is full size by t = .8:
const radius = 13 * seg(t, .55, .8);
```

Look at `plants.js` in the repository root: every plant uses the same handful of helpers.

**Motion.** A slow sway uses a CSS `@keyframes` rotating around the soil point (`transform-origin`). **Respect users who ask for less motion**: wrap animations in `@media (prefers-reduced-motion: no-preference)` or switch them off with `reduce`. A **thirsty** plant is the same drawing with a CSS filter (`saturate(.55)`) and a small tilt. It never dies.

### Exercises

**8.9.** Write `clamp`, `seg` and a `Leaf` component (`x`, `y`, `angle`, `length`) with a dark outline.

**8.10.** Draw the soil and the seed and sprout stages (`t` from 0 to .25) for the **tomato**.

**8.11.** Complete the tomato: stem growing with `t`, leaves alternating, flowers, and fruit that turns green, orange, then red.

**8.12.** Draw a **second** plant of your choice (chilli is the quickest). Stretch: all seven.

**8.13.** Show the plant name, the stage label from `stageOf`, a progress bar and `growth / need`.

**8.14.** Add the sway and the thirsty look, with reduced-motion support. Test with the browser's rendering emulation.

**8.15.** Add the **Harvest** button (only when ripe), the collection shelf, and the "pick your next seed" screen showing every plant at `t = .85`. Confetti is optional, and must also respect reduced motion.

## c. Weather

The server fetches the sky and caches it. The browser only draws it.

**Cache in the database.** In Part 3 you wrote an in-memory cache. Two servers would each have their own. Put it in the table instead:

```sql
INSERT INTO weather_cache (lat, lon, cond, is_day, temp_c, fetched_at)
VALUES ($1, $2, $3, $4, $5, now())
ON CONFLICT (lat, lon) DO UPDATE SET cond = EXCLUDED.cond, is_day = EXCLUDED.is_day, temp_c = EXCLUDED.temp_c, fetched_at = now();
```

Read it with `WHERE lat = $1 AND lon = $2 AND fetched_at > now() - interval '30 minutes'`. This is an **upsert**. Rounding the coordinates to two decimals (about a kilometre) means many users share a row, and your server never stores anyone's exact position.

**Privacy.** A location is personal data. Store only the rounded coordinates and a place name, make weather **opt in**, let the user clear it, and say in the interface that only rounded coordinates leave the device.

**Geolocation** (`navigator.geolocation.getCurrentPosition`) needs a user tap and permission, and works only on HTTPS (or `localhost`). Offer a **city search** as the alternative, proxied through your server to Open-Meteo's geocoding API.

**The scene** is layers: a sky gradient chosen from the condition and `is_day`, a sun or moon, clouds, precipitation, hills and the plant on top. Rain and snow are dozens of small absolutely positioned elements animated with CSS. Build a **preview mode** (client only) so you can see every weather without waiting for it. That is also how you test it.

### Exercises

**8.16.** Add the `weather_cache` migration. Move your weather endpoint's cache into it with the upsert above, a 30-minute lifetime, and stale-cache fallback when Open-Meteo is down (return the old row, flagged `stale: true`).

**8.17.** Add `PUT /api/me/location { lat, lon, place } | null` (validate ranges, round, store; `null` clears). `GET /api/weather` uses the saved location and returns `204` when none is set.

**8.18.** Add `GET /api/weather/search?q=` proxying Open-Meteo geocoding (rate limited, at most 5 results).

**8.19.** Build the `Scene` component: sky colours for the eight conditions by day and night (a lookup table), sun and moon, clouds.

**8.20.** Add rain, drizzle, snow, fog and the lightning flash with CSS animations, and hide the motion for `prefers-reduced-motion`.

**8.21.** Put the `Plant` inside the `Scene` on the Garden screen. The scene is 340 px tall on a phone and about 460 px on an iPad landscape, with the cards beside it.

**8.22.** Add the Me screen's weather settings: Off, Live (use my location, or pick a city) and Preview (choose a condition, toggle night).

**8.23.** Write the sentence that explains what is sent where, for the privacy line in the UI. Check it is true by watching the Network tab.

**8.24.** Add a short caption under the plant for each condition ("Rain is watering your plant for free."), and a thirsty message that overrides it.

## Checkpoint 8

- [ ] `growth.test.ts` passes (13 tests). The server's `GET /api/garden` agrees with `addPoints` on a replayed list of events.
- [ ] Ten simultaneous first actions of the day give exactly one `water` event.
- [ ] No endpoint accepts points from the client.
- [ ] Plants are drawn from `(type, t)`, harvest works, the collection shows.
- [ ] The weather is cached in PostgreSQL, uses rounded coordinates and falls back gracefully.

Tag it: `git tag part8`.

**Reference:** `plants.js`, `weather.js` and `core.js` (the growth functions) at the repository root.
