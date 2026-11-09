# 2a · Regular expressions and tokens

A pattern row is a list of **tokens** separated by commas: `MR, 6 sc, 2 dc in next st, ch 3`. In this section we learn to read *one* token and turn it into a stitch item.

## Regular expressions in ten minutes
A regular expression (regex) describes a shape of text. In JavaScript you write one between slashes:
```ts
const m = '6 sc'.match(/^(\d+)\s*x?\s*(.*)$/);
// m[0] = '6 sc'   m[1] = '6'   m[2] = 'sc'
```
| Piece | Means |
|---|---|
| `^` and `$` | the start and the end of the text |
| `\d` / `\d+` | a digit / one or more digits |
| `\s*` | any amount of spaces, including none |
| `.*` | anything, as much as possible |
| `(...)` | a **capture group**: `m[1]` is what it matched |
| `(?:...)` | a group you do not need to capture |
| `a\|b` | `a` or `b`; the **first** alternative that works wins |
| `(?![a-z])` | **look-ahead**: "and what follows is not a letter" |
| the `i` flag | ignore upper/lower case |

Build and test patterns on regex101.com (choose the *JavaScript* flavour) before pasting them into code. Paste the sample texts from the tests and watch which parts light up.

## Order matters
With `a|b`, the engine tries `a` first and stops at the first alternative that works. The same goes for a *list* of patterns tried one after the other, as in `matchStitchName`. "sc2tog" (a decrease) starts with "sc", so if the pattern for a single crochet came first it would match the "sc" and leave "2tog" behind. That is why `src/shared/stitchWords.ts` lists the more specific names first (`dec` before `sc`, `invdec` before `dec`, `dtr` before `tr` before `dc`), and why exercise 2.1 asks you to try them **in that order**.

## The word boundary problem
`/^sc/` also matches the start of "scarf". Adding `(?![a-z])` means "and the next character is not a letter". Then `sc` matches in `sc`, `sc,` and `sc2` (a digit may follow) but not in `scarf`.

## Peel the text from the front
A single giant regular expression for `then 6 sc in next st BLO` would be unreadable. Instead, `parseToken` takes things off the front in small steps, each easy to test:

1. **Normalise**: trim, lower-case, collapse repeated spaces, drop a leading "then" or "and".
2. **Nothing to read?** "turn" or an empty string: return `null`, record nothing.
3. **Loop modifier**: find and remove "BLO" or "back loop only".
4. **A count in front**: `6`, `6x`, `6 x`.
5. **The name**: use `matchStitchName`; the text after it is what remains.
6. **A count behind**: `ch 5`, `ch-5`.
7. **Leftovers**: "in next st" is fine and ignored; "wobble" is not.
8. **UK words**: with `ctx.uk`, "tr" means a US double crochet.
9. **Clamp** the count to 1..99.

After each step the remaining text is shorter, and the final result is built from the pieces. This "peeling" style is how most hand-written parsers work.

## Do not fail, collect
When something cannot be read, throwing an exception would make the whole import useless because of one odd word. Instead the parser carries a **context** object, `{ uk, unknown: [] }`. Unreadable text is pushed into `ctx.unknown`, the parser returns `null` for that token and carries on. The UI later shows "couldn't read: wobble" next to the row. The same idea (collect problems, keep going) shows up in form validation, linters and compilers.

## `null` as "nothing here"
`parseToken` returns `StitchItem | null`. The `| null` is part of the type, so every caller must decide what to do about it. Compare with throwing an error: `null` is for *expected* absence ("turn" is not a stitch), exceptions are for *unexpected* trouble.

## Exercises 2.1.

| | | file you edit |
|---|---|---|
| **2.1** [Read one stitch](../../exercises/part2-parsing/2.1-parse-token/README.md) | regular expressions, normalising | `src/parse/tokens.ts` |

The exercise has two functions, `matchStitchName` and `parseToken`. Do them in that order, and use the table of accepted shapes in the comment above `parseToken`.

Next: [2b · Groups, depth and recursion](b-groups-depth-and-recursion.md).
