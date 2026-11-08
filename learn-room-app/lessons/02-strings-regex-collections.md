# Phase 2: Strings, regex and collections

**You will build:** the "smart" part of the app: recognising the same product, deciding what is dormant, guessing categories from names and reading three kinds of bill.

## 1. Text is messier than you think

Vietnamese letters can be stored in two ways: `ữ` as one character, or `u` + two combining marks. `'ữ'.normalize('NFD')` splits them, then a regex over the combining-mark range (U+0300 to U+036F) deletes the marks:

```ts
'Sữa Đặc'.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')   // 'sua đac'
```

`đ` has no decomposition, so replace it yourself.

## 2. Regex: Unicode and word boundaries

`\b` ("word boundary") only knows ASCII letters. In `'bơ lạt'` the `ơ` counts as a non-letter, so `/\bbơ\b/` behaves wrongly. Instead use:

- the **`u` flag** to turn on Unicode mode;
- **`\p{L}`** ("any letter") and **`\p{N}`** ("any digit");
- an explicit boundary: `(^|[^\p{L}\p{N}])(word)([^\p{L}\p{N}]|$)`.

Always **escape** user-supplied or list-supplied text before putting it in a regex (`t-shirt`, `a.b`).

Build a `RegExp` once and reuse it. Constructing one on every call, for every item, is wasted work: cache it in a `Map`.

## 3. Collections

- `Set` answers "is x in here?" in constant time and ignores duplicates: perfect for words.
- `Map` is a dictionary with any key type and a defined order.
- Intersection and union of two sets give you similarity (Jaccard = |A∩B| / |A∪B|).
- Immutable update pattern: `items.map(i => replacements.get(i.id) ?? i)` returns new objects only where something changed.

## 4. Parsing is a state machine

A Shopee order is three kinds of line (name, `variation xN`, prices) that only make sense together. Walk the lines once, remember the *previous* line, and decide what each new line means. Check the most specific pattern first; the generic fallback ("this might be a product name") goes last.

Parsing numbers: `72.000` (dot = thousands) and `12,5` (comma = decimal) are valid in the same bill. Look at the shape of the text, not just the characters.

## 5. Dependency injection for tests

`parseShopee(text, today, guess = guessCategory)`: the category guesser is a **parameter with a default**. Production code calls `parseShopee(text, today)`. Tests pass `fakeGuess`, so a bug in `guessCategory` cannot make a Shopee test fail. Each exercise can fail on its own.

## Exercises

| | |
|---|---|
| 2.1 | `unaccent`, `nameTokens`, `sameProduct` |
| 2.2 | `isRebuy`, `applyRebuy` |
| 2.3 | `idleDays`, `dormantAfter`, `isDormant`, `needsAsk`, `dormantList` |
| 2.4 | `makeWordRegex`, `guessCategory` |
| 2.5 | `toNum`, `digitsOnly` |
| 2.6 | `parseReceipt` |
| 2.7 | `parseShopee` |
| 2.8 | `parseDineIn` |
| 2.9 | `detectFormat`, `parseBillText` |

## Check yourself

1. Why does `/\bbơ\b/` not work and what do you use instead?
2. What does `normalize('NFD')` do?
3. Why is `guess` a parameter of the parsers?
4. Which of `map`, `filter`, `sort`, `reverse`, `push` mutate the array?
