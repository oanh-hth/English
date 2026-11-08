## Hint 1
Build the patterns once: `STITCH_WORDS.map(([id, source]) => [id, new RegExp(`^(?:${source})(?![a-z])`, 'i')])`. The `(?![a-z])` stops "sc" matching inside "scarf".

## Hint 2
`matchStitchName`: loop over the patterns, return on the first match, using `match[0].length` to cut off the rest.
`parseToken`: after normalising, `text.match(/^(\d+)\s*x?\s*(.*)$/)` pulls off a leading count.

## Hint 3
Order of work in `parseToken`: normalise → return null for empty/"turn" → detect and remove BLO/FLO → leading count → `matchStitchName` (unknown? record and return null) → trailing count (`/^-?\s*(\d+)\b\s*(.*)$/` on the rest) → check leftovers → translate UK → clamp.
