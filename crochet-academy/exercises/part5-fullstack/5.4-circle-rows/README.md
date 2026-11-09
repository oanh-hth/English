# 5.4 · Build the circle chart

**Concepts:** generating data from a rule, loops with a changing pattern, reading a spec carefully, testing a result with a calculation you already wrote (`rowStats`).

**Prerequisite:** 1.3 (`rowStats`).

**File to edit:** `src/core/circleRows.ts`

## What to build
A flat crochet circle follows a simple rule: every round adds the same number of stitches (6 with single crochet, 8 with half doubles, 12 with doubles). `circleRows(stitch, rounds, color)` returns the whole pattern as chart rows.

You met the idea in 1.5 and 2.x: round 3 of a single-crochet circle is `(sc, inc) × 6`. Here you *produce* those rows instead of reading them. The tests do something nice: they count your rows with your own `rowStats` and check round `k` leaves exactly `n0 × k` stitches.

## How it connects
The photo importer (provided) measures a photo of a coaster: the yarn colour, and, with your `estimateRounds` (5.3), the number of rounds. Then it calls **your** `circleRows` to build the chart. When 5.3 and 5.4 are green, **Import from photo** works in the app.

## Done when
`npm run learn test 5.4` is green. That is the last exercise: your app is finished.
