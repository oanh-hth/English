## Hint 1
Copy the structure of your `SymbolChart`: early return for no rows, then `const layout = layoutRound(chart.rows);` and an `<svg>` that maps over `layout.wedges`.

## Hint 2
`<path d={wedgePath(cx, cy, wedge.r0, wedge.r1, wedge.start, wedge.end)} fill={row.color} />`. Get the row with `chart.rows[wedge.rowIndex]`.

## Hint 3
The symbol group: `` transform={`translate(${wedge.x} ${wedge.y}) rotate(${wedge.rotation}) scale(${wedge.scale})`} ``. The hub symbol is only rendered when `layout.hasMagicRing` is true: `{layout.hasMagicRing ? <g ...>...</g> : null}`.
