# 2b · Groups, depth and recursion

Real patterns repeat things: `(sc, inc) x 6`. The commas *inside* the brackets belong to the group, so splitting the whole row on commas would cut it in pieces. In this section we handle brackets and repeats.

## A depth counter
To split on commas only at the top level, walk the text one character at a time and keep track of how deep in brackets you are:

```ts
let depth = 0;
let current = '';
const parts: string[] = [];
for (const ch of text) {
  if (ch === '(' || ch === '[') depth++;
  if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
  if (ch === ',' && depth === 0) { parts.push(current); current = ''; }
  else current += ch;
}
parts.push(current);
```
Only a comma at depth 0 is a separator. `Math.max(0, ...)` protects you from stray closing brackets in messy text. The same counter finds the bracket that **matches** the first opening one: scan until the depth returns to zero.

This is a tiny **scanner**. Writing one by hand once makes parsers, compilers and JSON readers a lot less mysterious.

## The text after a bracket
After the closing bracket comes the repeat marker. All of these mean "repeat 6 times":

```
(sc, inc) x 6
(sc, inc) × 6
(sc, inc) 6 times
(sc, inc) repeat 5 more times        (5 more = 6 in total)
```
Write a helper `readRepeat(after)` that tries a regular expression per form and returns `{ rep, rest }` or `null`. The `rest` is whatever follows the marker (maybe `sl st` or `, ch 3`) and is parsed too.

What if there is **no** marker? `(counts as dc) sc`: the bracket was only a remark, so its contents are added inline, not as a group.

## Recursion again
The text inside the brackets is itself a sequence of tokens and groups, so the parser calls itself on it:

```ts
function parseSequence(text: string, ctx: ParseContext): Item[] {
  for (const part of splitTop(text)) {
    if (part starts with a bracket) {
      const children = parseSequence(insideTheBrackets, ctx);   // <- recursion
      ...
    } else {
      const item = parseToken(part, ctx);
      ...
    }
  }
}
```
This is the same shape as `expand` and `itemText` in part 1: handle the plain case, recurse for the nested one. Nested groups, `(sc, (ch 1) x 2) x 3`, come for free. Test the nested case early: it is the best check that the recursion is right.

## Small functions and shared state
`parseSequence`, `parseToken` and `readRepeat` all receive the same `ctx`, so unreadable text found deep inside a nested group still lands in one list. Passing a shared object down is simple and sometimes the best choice; when it gets complicated people move to a class or a closure, but start simple.

## Limits and defence
Repeats are clamped to 1..99, and a group with nothing readable inside is dropped. A parser that reads user text should never crash and never produce something the rest of the app cannot handle: no group with repeat 0, no infinite loop on unbalanced brackets (`splitTop('(sc, inc')` must still return something).

## Exercises 2.2.

| | | file you edit |
|---|---|---|
| **2.2** [Groups and repeats](../../exercises/part2-parsing/2.2-groups/README.md) | scanning, depth, recursion | `src/parse/groups.ts` |

Use `splitTop` for the splitting and `parseToken` (your 2.1) for the plain pieces. Write the unbalanced-bracket case as your own extra test if you like.

Next: [2c · Reading whole patterns](c-reading-whole-patterns.md).
