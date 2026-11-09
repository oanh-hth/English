# 3d · Round charts

Many crochet projects are worked **in the round**: coasters, hats, toys. Instead of rows you have rounds, drawn as **rings** around a centre. The two exercises here repeat the idea of section 3c (calculate, then draw) with a different geometry. If 3c made sense, this is a good test of it.

## Rings and wedges
Round 1 is a small ring in the middle, round 2 a bigger ring around it, and so on. Each stitch is a **wedge** of its ring: a slice between two angles and two radii. The stitches of one round share the full circle equally: a round with 12 stitches gives each wedge 30 degrees.

```
       ring 1 (6 stitches)  →  6 wedges of 60° each
       ring 2 (12 stitches) → 12 wedges of 30° each
```
A **magic ring** is not a stitch you can see. It sits in the hub, so `layoutRound` treats it separately: it only sets a flag (`hasMagicRing`) so the component can draw its symbol in the middle.

## Polar coordinates
A point at distance `r` from the centre at angle `t` (radians) has the position
```ts
x = cx + r * Math.cos(t);
y = cy + r * Math.sin(t);
```
On a screen, `y` grows **downwards**, so the angle `-Math.PI / 2` points straight up. We start each round at the top and go **counter-clockwise** (the direction right-handed crocheters work in), so the angle gets *smaller* for each stitch: `start = -PI/2 - index * span`, `end = start - span`.

Radians versus degrees: `Math.cos` and friends use radians (a full circle is `2 * Math.PI`), but SVG's `rotate(...)` wants degrees, so you convert with `* 180 / Math.PI`.

The symbol of each stitch should point **away from the centre**, like a petal. The rotation is `(mid + PI/2)` in radians, where `mid` is the middle angle of the wedge. Draw it on paper for the top wedge (`mid = -PI/2`) to see why the answer is zero degrees there.

## Testing numbers that are not round
Angles and radii are floating-point numbers, so the tests use `toBeCloseTo` for them (equal to within a small tolerance). Always prefer that over `toBe` for results of `sin` and `cos`.

## The drawing
`RoundChart` is a sibling of the `SymbolChart` you wrote in 3c: early return when there is nothing to draw, call the layout, `map` the result to elements. The new ingredient is the wedge shape. An SVG `<path>` is described by a string of commands: `M` (move), `A` (arc), `L` (line), `Z` (close). Writing arcs by hand is fiddly, so `wedgePath(cx, cy, r0, r1, start, end)` is **provided** in `src/client/chart/wedge.ts`. You only call it.

Compare your two components. They differ in what the layout returns and in the shape they draw, and agree on everything else: *the same job, a different layout*. That is a sign the split between calculation and drawing was the right one.

## What the app can do now
In the editor, switch a chart to **In the round**: the right-hand panel now draws rings. With 3.6 and 3.7 green, **the whole editor is finished**. Try this: click **Import pattern**, press *Try an example*, create the chart and watch the pink flower coaster appear as rings.

## Exercises 3.6.-3.7.

| | | file you edit |
|---|---|---|
| **3.6** [Rings and wedges](../../exercises/part3-react/3.6-round-layout/README.md) | polar coordinates, angles | `src/client/chart/layoutRound.ts` |
| **3.7** [The round chart](../../exercises/part3-react/3.7-round-chart/README.md) | SVG paths, reusing a pattern | `src/client/chart/RoundChart.tsx` |

When both are green: tick the items for part 3, answer the [review questions](README.md) in `notes/part3.md`, do the milestone, and continue with [part 4](../part4-node/README.md).
