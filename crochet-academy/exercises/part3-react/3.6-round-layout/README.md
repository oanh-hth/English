# 3.6 · Rings and wedges

**Concepts:** polar coordinates (angle + radius to x, y), `Math.sin` / `Math.cos`, radians vs degrees, the same "calculate first, draw later" split as 3.4.

**Prerequisite:** 1.2 (`expand`).

**File to edit:** `src/client/chart/layoutRound.ts`

## What to build
A crochet circle is worked from the middle outwards. Draw round 1 as a small ring, round 2 as a bigger ring around it, and so on. Every stitch is a **wedge** of its ring.

`layoutRound(rows, options)` returns the size of the drawing, and for every stitch its wedge (inner/outer radius, start/end angle) plus where its symbol goes and how far to turn it so it points away from the centre. The numbered rules in the comment above the function give every formula; this exercise is about carrying them out accurately.

## Quick refresher
* A point at radius `r` and angle `t` (radians) is `x = cx + r * cos(t)`, `y = cy + r * sin(t)`. In an SVG, `y` grows downwards, so angle `-PI / 2` points straight up.
* We go counter-clockwise from the top, so each wedge's angle gets **smaller**.

## See it
It feeds the round chart you build next (3.7).

## Done when
`npm run learn test 3.6` is green.
