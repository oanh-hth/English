# 2c · Reading whole patterns

We can read a row. Now we read a whole pasted pattern: a title, several rows with headers like `Round 1:`, some ranges, notes. The result is the data for the **Import pattern** dialog.

## A pipeline
A good parser is a **pipeline**: each step takes the output of the one before, and each is simple on its own.

```
text
 → normalise (line endings, dashes, ×)
 → split into lines, and split a line that holds several headers
 → find the headers, join continuation lines to the row before them
 → per row: strip the total "(12)", parse the rest with parseSequence
 → expand ranges ("Rounds 3-5")
 → work out whether it is round or flat
```
Write the steps as separate small pieces first, then connect them. When a test fails you will know which step to look at.

## Headers
`Round 1:`, `Rnd 2.`, `R3)`, `Row 4:`, `Rounds 3-5:`. One regular expression with capture groups covers them:
```ts
/^\s*(?:rounds?|rnds?|rows?|r)\s*\.?\s*(\d+)(?:\s*-\s*(\d+))?\s*[:.)]\s*(.*)$/i
```
Its three groups are the first number, the optional last number and the rest of the line. Read it piece by piece with regex101.com.

Sometimes a whole pattern is pasted on one line: `Round 1: MR, 8 dc. Round 2: (dc, ch 2) x 8.` A **look-behind and look-ahead** replacement inserts a newline in front of every header that follows something else, so the rest of the code only sees one row per line.

## Messy but expected
* Lines **before** the first header (the pattern's title, the author) are ignored.
* A line that is not a header continues the row before it (a long row wrapped over two lines).
* Totals at the end, `(12)`, `[24]`, `= 18 sts`, are for humans; the app calculates its own, so they are removed first.
* **Ranges** make copies. `Rounds 3-5: sc around` is three identical rows. Use `structuredClone` so the copies are independent objects (the test checks it).
* If a row yields no readable items, it is reported in `skipped` and does not become a row.

## Round or flat?
The result carries `mode`. It is `'round'` when the text says "round" or "rnd", or when a row uses a magic ring (even inside a group: check recursively). Otherwise it is `'flat'`. This small recursive search (`usesRing(items)`) is the same shape as the functions of part 1.

## Test-driven development
Each rule above is a test in `pattern.test.ts`. A good way to work: make the first test pass, then the next, committing as you go. Resist writing everything at once. When a rule seems unclear, write your own small test for it before changing the code.

## Edge cases are the work
CRLF line endings, en dashes in ranges ("2–3"), headers in the middle of a line, UK terms: none of these is hard, but forgetting any of them makes the importer fail on real text. When you finish, paste a pattern from a blog into the importer and see what breaks. That is how real parsers improve.

## What the app can do now
Run `npm run dev` and open **Import pattern** on the *My charts* page. Press *Try an example*, check the rows it found, and **Create chart**. The editor then shows your parsed pattern as cards.

## Exercises 2.3.

| | | file you edit |
|---|---|---|
| **2.3** [Read a whole pattern](../../exercises/part2-parsing/2.3-pattern/README.md) | pipelines, edge cases | `src/parse/pattern.ts` |

When it is green: tick the items for part 2, answer the [review questions](README.md) in `notes/part2.md`, do the milestone, and continue with [part 3](../part3-react/README.md).
