# Phase 2 · Parsing written patterns

**Goal:** turn text people write ("Round 3: *2 dc, ch 1* repeat 11 more times") into the data model from phase 1.

Parsing is a classic way to practise careful thinking: messy input in, clean structure out, and a long tail of edge cases. The method is the same every time: **normalise, split, parse the pieces, collect what you could not read**.

## 1. Regular expressions in ten minutes
| Pattern | Means |
|---|---|
| `^` / `$` | start / end of the text |
| `\d+` | one or more digits |
| `\s*` | any amount of spaces (including none) |
| `(...)` | a capture group: `match[1]` is its text |
| `(?:...)` | a group you do not need to capture |
| `a\|b` | a or b (the **first** that matches wins: order matters) |
| `(?![a-z])` | look-ahead: "not followed by a letter" (so `sc` does not match inside `scarf`) |
| `i` flag | ignore case |

```ts
const m = '6 sc'.match(/^(\d+)\s*x?\s*(.*)$/);   // m[1] = '6', m[2] = 'sc'
```
Build and test patterns at https://regex101.com (choose the JavaScript flavour) before you paste them in. (2.1)

## 2. Peel the text from the front
`parseToken` works by repeatedly taking something off the start: filler words, then a count, then the name, then leftovers. After each step the remaining text gets shorter, and what is left is checked at the end. Compare with starting from a giant regular expression: small steps are easier to read, test and extend. (2.1)

## 3. Scanning with a depth counter
You cannot split `(sc, inc) x 6, ch 2` on commas with `.split(',')`: that cuts inside the brackets. Walk the characters, count how deep you are, and only cut at depth 0. The same trick finds the bracket that matches the opening one. (2.2)

```ts
let depth = 0;
for (const ch of text) {
  if (ch === '(') depth++;
  if (ch === ')') depth--;
  ...
}
```

## 4. Recursion again
The text inside a bracket is itself a sequence, so `parseSequence` calls itself on it. Your phase 1 recursion pays off here. (2.2)

## 5. Collecting problems instead of failing
A pattern you paste may contain things the parser cannot read. Throwing an exception on the first one would make the importer useless. Instead the parser carries a context object `{ unknown: [] }`, pushes the unreadable text into it, and carries on. The UI then shows "couldn't read: …" next to the row. This is a very common design for tolerant input handling. (2.1 to 2.3)

## 6. Edge cases are the work
Notice how many rules in `parsePattern` are about odd input: CRLF line endings, en dashes, headers in the middle of a line, ranges, continuation lines. Write each rule as a test first, see it fail, then make it pass. That is test-driven development.

## Pitfalls
* Regular expression greediness: `.*` grabs as much as it can; `.*?` grabs as little.
* Forgetting that `String.replace` with a string pattern replaces only the first match; use a regex with the `g` flag.
* Mutating the shared context in one branch and expecting the other branch to ignore it.
* Off-by-one when slicing around a matched bracket.

## Checkpoint (write answers in `notes/phase-2.md`)
1. Why does the order of alternatives in a regular expression matter? Use "double treble" vs "double crochet".
2. Why can't you use `.split(',')` for `splitTop`?
3. What does `parseToken` do with text it cannot understand, and why?
4. What is a look-ahead and why is `(?![a-z])` used after each stitch name?
5. How would you add support for a new phrase such as "repeat from * to end"? Which tests would you write first?

## Milestone
Run `npm run dev`, click **Import pattern**, press **Try an example** and create the chart.

## Further reading
* MDN: *Regular expressions* guide — https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_expressions
* regex101.com, and *Crafting Interpreters* (free online) for a deeper look at scanners and parsers.
