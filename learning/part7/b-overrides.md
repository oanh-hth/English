# 7b: Overrides: edit and delete built-in content

## Why not edit the data file?

The built-in content ships with the app (it is **read-only data**). If a user edits "What's up?" and you change the source object, then:

- the change is lost on the next app update,
- you can't offer "Reset to original",
- and two versions of the app disagree.

Instead, keep the original untouched and store **what the user changed** separately:

```ts
interface Overrides {
  edits: Record<string, Partial<Item>>; // id → changed fields
  deleted: Record<string, number>;      // id → when it was deleted
}
```

The visible list is the **original data with the overrides applied**. Applying is a pure function:

```ts
export function effectiveItems(
  base: readonly Item[], custom: readonly Item[], o: Overrides,
): Item[] {
  return [...base, ...custom]
    .filter(i => !o.deleted[i.id])
    .map(i => ({ ...i, ...(o.edits[i.id] ?? {}) }) as Item);
}
```

(Think about the cast `as Item`: spreading a partial of a union can't be proven safe by TypeScript. Where could a bad override break things? That's why overrides must be **validated** when saved and when loaded.)

This "base + patch = current" idea appears everywhere: Git, Redux undo, database migrations, game save files.

## Operations

| Action | What it does to the store |
|---|---|
| Edit built-in | `edits[id] = { ...fields }` |
| Reset to original | `delete edits[id]` |
| Delete built-in | `deleted[id] = now`; remove its card and flag |
| Restore deleted | `deleted = {}` |
| Undo all my edits | `edits = {}` |
| Edit custom | update the item in `custom` |
| Delete custom | remove it from `custom`, plus its card |

Because every operation is a plain object change, each is one **reducer case**, and each is easy to unit test.

## What happens to review history?

Decide and document it:

- **Delete** an item: remove its card (the learner no longer wants it). If it's restored later it starts fresh. Say so in the confirm dialog.
- **Edit** an item: keep the card. The learner is still learning the same thing; you only fixed the wording.
- **Delete during a review session**: remove the ID from the **current queue** too, adjusting the index so you don't skip a card.

Edge cases like the last one are where bugs live. Write the test first:

```ts
test('deleting the current card keeps the next one in place', () => {
  // queue ['a','b','c'], i = 1 (on 'b'); delete 'b' → queue ['a','c'], i = 1 (on 'c')
});
```

## The edit form

Reuse the add form with initial values. For built-in items:

- Show the item's original text under the field when it was edited ("Original: ...").
- Offer **Reset to original** when an override exists.

For custom items, also allow **moving to another topic** (it's just a field).

## Exercises

**7.6** Add `edits` and `deleted` to the store with reducers for each operation in the table. Write tests for every case, including "edit then reset equals original".

**7.7** Write `effectiveItems` and use it as the single source of the item list for **all** screens (topics, search, exercises, review). Test it.

**7.8** Add **Edit** and **Delete** buttons to the item detail sheet (and to the Review answer card). Edit uses your form with the current values; delete asks for confirmation that mentions what is lost.

**7.9** Handle deletion during a review/learn session (remove from the queue, fix the index) and test the reducer.

**7.10** On the Me page show "You edited N and deleted M items" with **Restore deleted** and **Undo my edits** buttons.

**7.11** In `notes.md`: what could go wrong if an override has a field with the wrong type (for example `tone: 5`)? Where in your app should that be checked? Add that check.
