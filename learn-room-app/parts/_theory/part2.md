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
