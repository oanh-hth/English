# 4c: The Review session

The screen you'll use every day. Behaviour (compare with the finished app):

1. Gather every card that is **due** (`due <= now`), oldest first.
2. Show the **front**: the meaning (speaking card) or just an audio button (listening card).
3. Learner taps **Show answer**: the back shows the phrase, meaning, context, example and audio plays.
4. Learner grades **Again / Hard / Good / Easy**; each button shows when the card will return.
5. **Again** puts the card at the end of *this* session's queue too, so you see it again soon.
6. When the queue is empty, show a summary.

## Model the session

```ts
interface ReviewState {
  queue: string[];     // item IDs
  i: number;
  revealed: boolean;
  done: number;
}
type Action =
  | { type: 'reveal' }
  | { type: 'grade'; grade: Grade };
```

The reducer for the session handles only **session** concerns; the **scheduling** is the store's job (`dispatch({type: 'grade', ...})` on the store). Two small reducers with clear jobs beat one large one.

```tsx
function sessionReducer(s: ReviewState, a: Action): ReviewState {
  switch (a.type) {
    case 'reveal':
      return { ...s, revealed: true };
    case 'grade': {
      const id = s.queue[s.i];
      if (id === undefined) return s;
      const queue = a.grade === 0 ? [...s.queue, id] : s.queue; // Again: see it again this session
      return { queue, i: s.i + 1, revealed: false, done: s.done + 1 };
    }
  }
}
```

## Wiring the two together

```tsx
function ReviewSession({ items }: { items: Map<string, Item> }) {
  const { state, dispatch: store } = useStore();
  const [s, dispatch] = useReducer(sessionReducer, undefined, () => ({
    queue: dueIds(state.cards, Date.now()), i: 0, revealed: false, done: 0,
  }));
  const id = s.queue[s.i];
  const item = id ? items.get(id) : undefined;
  const card = id ? state.cards[id] : undefined;

  function grade(g: Grade) {
    if (!id) return;
    store({ type: 'grade', id, grade: g, now: Date.now() });  // schedule it
    dispatch({ type: 'grade', grade: g });                    // move the session on
  }
  // ...render front/back, buttons with intervalLabel(card, g)
}
```

Notice `Date.now()` is called in the **event handler**, which is where impure things belong, then passed into pure functions.

Also note the initial queue is computed **once** (lazy initializer). If it were recomputed every render, cards would vanish from the queue as soon as you graded them.

## Speaking and listening cards

The app alternates: a card with an **even** `reps` is a *speaking* card (meaning → recall the phrase); **odd** `reps` is a *listening* card (audio → recall the meaning). This is a tiny rule with a big benefit: practising both directions.

```ts
const listening = card.reps % 2 === 1;
```

## Home screen numbers

Now Home can show real data:

- **Due now:** `dueIds(state.cards, now).length`
- **Studied today:** `state.log[dayKey(now)]` reviews + learned
- **Streak:** your `streak()` from 4b

## Exercises

**4.12** Write `sessionReducer` (reveal, grade) and unit-test it (grade advances; revealed resets; Again re-queues the ID; grade on an empty queue changes nothing).

**4.13** Build `ReviewSession`: front/back, speaking vs listening cards, audio on reveal, and four buttons showing `intervalLabel(card, g)`.

**4.14** Show a summary when the queue is finished. Add a "Review" entry on Home showing the due count (disabled when zero).

**4.15** Make Home show *studied today* and *streak* from the store. Learn three items, review them, and watch the numbers change.

**4.16** Time travel: in a test, create cards with specific `due` times and prove `dueIds` + your session start only with the ones that are due. (You are testing behaviour that would otherwise take days to see.)

**4.17** Compare your Review screen with `VIEWS.session`, `A.flip` and `A.rate` in the finished app's `app.js`. Write one thing the finished app does that yours doesn't yet. Then `git tag part4`.
