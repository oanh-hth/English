# 5b: The main pages, driven by data

Every page of this app is a **function of data**. Before coding a page, list the data it needs and where it comes from.

| Page | Data it needs | Comes from |
|---|---|---|
| Home | due count, studied today, streak, next suggestions | store (`cards`, `log`) |
| Topics | units grouped, counts per unit, deck progress | static data + store |
| Unit | one unit's phrases and words, what's new, exercise counts | static data + store |
| Practice | all units, scenarios | static data |
| Me | stats, settings, reset | store |

## One place for derived data

Don't recompute "the items of a unit" in every component. Write small **selector** functions (pure, testable) and call them where needed:

```ts
export function unitCounts(unit: Unit, items: readonly Item[], cards: State['cards']) {
  const list = itemsOfUnit(unit, items);
  return {
    phrases: list.filter(i => i.kind === 'phrase').length,
    words: list.filter(i => i.kind === 'word').length,
    inDeck: list.filter(i => cards[i.id]).length,
    total: list.length,
  };
}
```

If a calculation is slow or runs on every render, wrap it with `useMemo(() => ..., [deps])`; for this app's data size you rarely need it. **Measure before optimizing.**

## A lookup map

Review needs to find an item by ID fast. Build a `Map` once at module load:

```ts
export const itemById = new Map(items.map(i => [i.id, i] as const));
```

## Pages in practice

```tsx
function Home() {
  const { state } = useStore();
  const now = Date.now();
  const due = dueIds(state.cards, now).length;
  const today = state.log[dayKey(now)];
  return (
    <>
      <h1>Speak Natural</h1>
      <section className="hero">
        <div className="big">{due}</div>
        <p>{due ? 'items ready to review' : "You're all caught up."}</p>
        <Link to="/review" aria-disabled={!due}>Start review</Link>
      </section>
      <p>{(today?.reviews ?? 0) + (today?.learned ?? 0)} studied today · {streak(state.log, now)}-day streak</p>
    </>
  );
}
```

Note the **optional chaining** `today?.reviews ?? 0` for a day with no activity.

Pages combine small components you already have: `TopicRow`, `PhraseList`, `Card`. If a page grows past about 150 lines, split it.

## The unit page's four jobs

1. Header with progress ("12 of 109 in your deck").
2. **Learn** buttons (counts of *new* phrases and words): link to `/learn/:unitKey/:kind`.
3. **Practice** section: link/buttons per exercise type (Part 6 fills this in).
4. **Browse** list with a Phrases | Words switch (a piece of local state).

## Exercises

**5.6** Create `selectors.ts` with `unitCounts` and `newItems(unit, items, cards, kind)`; unit-test both with a tiny fake data set.

**5.7** Build the **Home** page with due count, studied-today and streak from the store; the Start review link is disabled when nothing is due.

**5.8** Build the **Topics** page: grouped units with `unitCounts`, progress bars and the search from 5.5.

**5.9** Build the **Unit** page: header, Learn buttons (with counts, disabled when zero), the Browse list with the Phrases/Words switch, and the item detail sheet.

**5.10** Build **Practice** (list of units; role-plays arrive in Part 6) and **Me** (stats, reset with confirmation).

**5.11** Add `itemById` and show a "Not found" screen for `/learn/:unitKey/:kind` when `kind` isn't `phrase` or `word` or the unit has nothing new.
