## Hint 1
Expand every row first: `const expanded = rows.map((r) => expand(r.items))`. Then drop the magic rings from each list with `.filter((c) => c.st !== 'mr')`. A row whose filtered list is empty gets no ring.

## Hint 2
Keep a `ring` counter that goes up by one each time you draw a ring. `r0 = hub + ring * ringH + 1.5`, `r1 = r0 + ringH - 3`, `rm = (r0 + r1) / 2`.

## Hint 3
For wedge `index` of `n`: `span = n === 1 ? 2 * Math.PI - 0.001 : (2 * Math.PI) / n`; `start = -Math.PI / 2 - index * span`; `end = start - span`; `mid = (start + end) / 2`. Then `x`, `y` and `rotation` use `mid`. Write a tiny `clamp(v, lo, hi)` helper for the scale.
