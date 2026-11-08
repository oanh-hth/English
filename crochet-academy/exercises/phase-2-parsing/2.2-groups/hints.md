## Hint 1
`splitTop`: keep a `depth` counter. Increase it on `(` and `[`, decrease on `)` and `]`. Only cut at a comma when `depth === 0`.

## Hint 2
`parseSequence`: for each piece, if it starts with a bracket, find the matching closing bracket with the same depth trick. The inside is parsed with a recursive call; the text after it is the "repeat marker".

## Hint 3
Write a helper `readRepeat(after)` that returns `{ rep, rest } | null` using three regular expressions:
`/^\s*[x×]\s*(\d+)/`, `/^\s*repeat\s+(\d+)\s*(more\s+)?times?\b/i` and `/^\s*(\d+)\s*times?\b/i`. Whatever `rest` is left should be parsed again with `parseSequence`.
