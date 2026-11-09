# Part 2: Rules of the room

> Generated from `parts/_theory` and `curriculum.json` by `npm run docs`. Edit those, not this file.

**In this part:** Teach the app to think: same-product detection, the rebuy rule, dormant items and category guessing.

Now the app learns to think. Which two names are the same product? When you buy milk again, should last month's milk disappear? Which things have you forgotten? What category is "Bỉm Huggies"? These are the rules that make the room feel smart, and they all need careful handling of text and collections.

## a) Text is messier than you think

Vietnamese letters can be stored in two ways: `ữ` as one character, or `u` + two combining marks. `'ữ'.normalize('NFD')` splits them, then a regex over the combining-mark range (U+0300 to U+036F) deletes the marks:

```ts
'Sữa Đặc'.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')   // 'sua đac'
```

`đ` has no decomposition, so replace it yourself.

## b) Regex: Unicode and word boundaries

`\b` ("word boundary") only knows ASCII letters. In `'bơ lạt'` the `ơ` counts as a non-letter, so `/\bbơ\b/` behaves wrongly. Instead use:

- the **`u` flag** to turn on Unicode mode;
- **`\p{L}`** ("any letter") and **`\p{N}`** ("any digit");
- an explicit boundary: `(^|[^\p{L}\p{N}])(word)([^\p{L}\p{N}]|$)`.

Always **escape** user-supplied or list-supplied text before putting it in a regex (`t-shirt`, `a.b`).

Build a `RegExp` once and reuse it. Constructing one on every call, for every item, is wasted work: cache it in a `Map`.

## c) Collections

- `Set` answers "is x in here?" in constant time and ignores duplicates: perfect for words.
- `Map` is a dictionary with any key type and a defined order.
- Intersection and union of two sets give you similarity (Jaccard = |A∩B| / |A∪B|).
- Immutable update pattern: `items.map(i => replacements.get(i.id) ?? i)` returns new objects only where something changed.

## Exercises 2.1-2.4

Work in `src/`, read the doc comment above each function (it is the specification), and read the tests: they are examples of how your code is used. Check with `npm run check <id>`. Hints are one command away: `npm run learn -- hint <id>`.

### 2.1 Are these the same product?

Remove accents with `normalize('NFD')`, split names into meaningful words and decide with set arithmetic.

* **Practice:** Normalise text and compare word sets
* **Edit:** `src/domain/names.ts`
* **Tests:** `tests/part2/names.test.ts`
* **Run:** `npm run check 2.1`

<details><summary>Hints</summary>

1. `đ` does not decompose; replace it by hand.
2. Intersection and union sizes are enough for both rules.

</details>

### 2.2 The rebuy rule

When you buy something again, last month's copy leaves the room. Return new objects, never mutate.

* **Practice:** Immutable updates with Map
* **Edit:** `src/domain/rebuy.ts`
* **Tests:** `tests/part2/rebuy.test.ts`
* **Run:** `npm run check 2.2`

<details><summary>Hints</summary>

1. `{ ...older, used: true }` copies an object.
2. Use a Map from id to its replacement and `items.map(i => map.get(i.id) ?? i)`.

</details>

### 2.3 Dormant items

Find items nobody touched for a long time, with different thresholds per category and a snooze.

* **Practice:** Compose helpers into business rules
* **Edit:** `src/domain/dormant.ts`
* **Tests:** `tests/part2/dormant.test.ts`
* **Run:** `npm run check 2.3`

<details><summary>Hints</summary>

1. Read the doc comment of `isDormant` as a list of early returns.
2. `needsAsk` is one line if `isDormant` and `inDate` exist.

</details>

### 2.4 Guess the category

Match whole words in Vietnamese. `\b` only understands ASCII, so build the boundary yourself with `\p{L}` and the `u` flag.

* **Practice:** Unicode regex and caching
* **Edit:** `src/domain/guess.ts`
* **Tests:** `tests/part2/guess.test.ts`
* **Run:** `npm run check 2.4`

<details><summary>Hints</summary>

1. Look-around is not needed: capture groups on both sides are enough for `test`.
2. Cache each category's RegExp in a Map; building a RegExp is not free.

</details>

## What your app can do now

You can add items from the terminal: the category is guessed, buying milk again retires last month's milk, and idle things are reported.

```bash
npm run room -- add "Sữa tươi tiệt trùng" --price 33000 && npm run room
```

## Check yourself

Tick these with `npm run learn -- tick <id>` when you can honestly say yes.

- **2.m1** I ran the milestone command and saw a guessed category and the rebuy message
- **2.m2** I can write a regex that matches whole Vietnamese words and say why `\b` fails
- **2.m3** I can explain `normalize('NFD')`
- **2.m4** I know which of map, filter, sort, reverse, push mutate the array
