## Hint 1
`const groups = stitchesByCategory();` is an object. Use `Object.keys(groups) as StitchCategory[]` to map over the categories.

## Hint 2
Each `.map()` result needs a `key` prop: `key={category}` and `key={stitch.id}`.

## Hint 3
`aria-label={name}` gives the button its accessible name, even though the visible text is the abbreviation. `aria-pressed={stitch.id === selected}`.
