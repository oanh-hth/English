# Part 5d: Graphs and the link map

*[Part 5: Linked work: notes, resources and the link map](README.md) · section d*

The **link map** draws everything at once: tasks, the notes and sketches attached to them, and the resources they use, as dots and lines. It shows how your work hangs together. In this section you turn the state into a graph, lay it out with a small physics simulation, and draw it in SVG.

## From state to a graph

A graph is **nodes** (things) and **edges** (connections). Building it is a pure function of the state:

- every task is a node;
- notes and sketches that belong to a task are nodes, with an edge to their task;
- resources attached to at least one task are nodes, with an edge from each task, marked "used" or "planned";
- linked tasks get one edge per pair. Links are stored on both tasks, so pick a rule ("from the one that comes first") to avoid drawing every line twice.

## Laying it out: a force simulation

Where should each dot go? A classic trick is to pretend it's physics:

- every pair of nodes **pushes apart**, harder when they're close (force ∝ 1 / distance²), so nothing overlaps;
- every edge **pulls** its two ends towards a comfortable length, like a spring;
- a gentle pull to the centre keeps everything on screen.

Repeat a few hundred small steps and the picture settles: connected things end up close together.

```ts
for (let it = 0; it < iterations; it++) {
  // 1. sum forces for every node
  // 2. move each node by its force, then keep it inside the margins
}
```

Start from a fixed arrangement (a circle) instead of random positions. Then the same state always gives the same map, which is better for people and for tests. This is **deterministic**: no `Math.random()`.

Two nested loops over all nodes is *n²* work. That's fine for a few hundred items. Large graph tools use cleverer methods, but the idea is the same.

## Drawing in SVG

SVG is HTML for drawings. React renders it like any other element:

```tsx
<svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Map of 4 tasks and 6 connections">
  {edges.map(e => <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />)}
  {nodes.map(n => (
    <g transform={`translate(${n.x} ${n.y})`} role="button" tabIndex={0} onClick={() => onOpen(n)}>
      <circle r={12} /><text y={28}>{n.label}</text>
    </g>
  ))}
</svg>
```

`viewBox` sets your own coordinates; CSS decides the actual size, so the map scales to the iPad's screen. Draw lines first so dots sit on top.

## Making drawings usable

A `<g>` isn't a button, so give it `role="button"`, `tabIndex={0}` (reachable with the keyboard), a name, and handle Enter and Space as well as clicks. Describe the whole picture in the `<svg>`'s `aria-label`.

## Performance: `useMemo`

Laying out the graph is heavy compared with everything else. The map page computes it with `useMemo`, so it only re-runs when the state changes, not on every render.

## Read more
- Force-directed graph drawing (Wikipedia): <https://en.wikipedia.org/wiki/Force-directed_graph_drawing>
- SVG tutorial (MDN): <https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial>
- `useMemo`: <https://react.dev/reference/react/useMemo>

---

## Exercises 5.6–5.7

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 5.6: Build and lay out the graph

**Edit:** `app/client/src/map/graph.ts` · **Tests:** `tests/part-5/5.6-graph.test.ts` · **Run:** `npm run ex 5.6`

Write `graphFromState` (nodes and each edge once) and `layout` (the deterministic force simulation, inside the margins, without mutating its input). The tests check bounds, determinism, and that connected nodes end up closer than unconnected ones.

### 5.7: LinkMap

**Edit:** `app/client/src/components/LinkMap.tsx` · **Tests:** `tests/part-5/5.7-link-map.test.tsx` · **Run:** `npm run ex 5.7`

Build `LinkMap`: an `<svg role="img">` describing the map, a `<line data-kind>` per edge, and a keyboard-accessible `<g role="button">` per node that opens it. Then open the Link map page and tap around.

---

[← 5c Resources and attachments](c-resources.md) · [Part 6: Sketching with Apple Pencil →](../part-6/README.md)
