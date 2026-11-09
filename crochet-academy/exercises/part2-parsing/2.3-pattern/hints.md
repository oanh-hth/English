## Hint 1
Normalise first: remove `\r`, turn en/em dashes into `-`, turn `×` into `x`. Then split into trimmed, non-empty lines.

## Hint 2
A header regex: `/^\s*(?:rounds?|rnds?|rows?|r)\s*\.?\s*(\d+)(?:\s*-\s*(\d+))?\s*[:.)]\s*(.*)$/i`. Its three groups are *first number*, *last number (optional)* and *the rest of the line*.
For headers in the middle of a line, a look-behind/look-ahead replace inserts a newline: `/(?<=\S)[ \t]*(?=\b(?:rounds?|rnds?|rows?|r)\s*\d+(?:\s*-\s*\d+)?\s*:)/gi`.

## Hint 3
Collect `raw` rows `{ from, to, text }` first (handling continuation and preface lines), then loop over them: strip the total, `parseSequence`, skip empty results, and push `structuredClone(items)` once per round in the range.
