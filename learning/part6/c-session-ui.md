# 6c: The exercise session

## A small state machine

Each question goes through these states:

```
asking ──(correct)──► correct ──► next question
   │
   └──(wrong, 1st time, build/type)──► asking (retry once) ──(wrong again)──► revealed
   └──(wrong, mcq / "I don't know")──► revealed ──► next question
```

State you need:

```ts
interface ExState {
  qs: Question[];
  i: number;
  status: 'asking' | 'correct' | 'wrong';
  pick: number | null;     // chosen option for mcq
  built: number[];         // indexes into q.bank, in the order tapped
  typed: string;
  tries: number;
  correct: number;         // first-try correct answers
  missed: string[];        // item IDs to reschedule
}
```

Keep the rules in a **reducer** so they're testable:

```ts
type Action =
  | { type: 'pick'; index: number }
  | { type: 'tile'; index: number }
  | { type: 'untile'; at: number }
  | { type: 'type'; text: string }
  | { type: 'check' }
  | { type: 'skip' }
  | { type: 'next' };
```

For example, handling `pick`:

```ts
case 'pick': {
  const q = s.qs[s.i];
  if (!q || q.kind !== 'mcq' || s.status !== 'asking') return s;
  const ok = a.index === q.answer;
  return {
    ...s, pick: a.index, status: ok ? 'correct' : 'wrong',
    correct: s.correct + (ok ? 1 : 0),
    missed: ok ? s.missed : [...s.missed, q.id],
  };
}
```

`if (q.kind !== 'mcq')` is **narrowing**: after it, TypeScript knows `q.answer` exists.

## Checking build and type answers

```ts
case 'check': {
  const q = s.qs[s.i];
  if (!q || s.status !== 'asking') return s;
  const attempt = q.kind === 'build' ? s.built.map(i => q.bank[i]).join(' ')
                : q.kind === 'type' ? s.typed : null;
  if (attempt === null || !q.target) return s;
  if (norm(attempt) === norm(q.target)) return { ...s, status: 'correct', correct: s.correct + (s.tries === 0 ? 1 : 0) };
  const missed = s.missed.includes(q.id) ? s.missed : [...s.missed, q.id];
  return s.tries >= 1 ? { ...s, status: 'wrong', missed } : { ...s, tries: 1, missed };
}
```

(Types are slightly simplified; make yours compile.)

## The view

```tsx
switch (q.kind) {
  case 'mcq':   return <McqView q={q} state={s} dispatch={dispatch} />;
  case 'build': return <BuildView q={q} state={s} dispatch={dispatch} />;
  case 'type':  return <TypeView q={q} state={s} dispatch={dispatch} />;
}
```

- Show feedback after answering: "Correct!" or "Answer: …", with the item's meaning and example, and play the audio.
- Options after answering: the right one green, a wrong pick red, buttons locked.
- For `type` questions use a real `<input>` with `autoCapitalize="off"` and `spellCheck={false}`; Enter should submit.
- Start audio from the **tap**, as always (`useSpeech`).

## Using the results

When the session ends:

- Show `correct / total`.
- For each ID in `missed`, make sure the item is in the deck and **due now**:

```ts
for (const id of s.missed) store({ type: 'ensureDue', id, now: Date.now() });
```

Add `ensureDue` to your store reducer: create the card if missing, otherwise set `due = Math.min(due, now)`. A mistake in practice becomes a review in your queue: practice feeds the scheduler.

## Routing

`/practice/:unitKey/:type` where `type` is a key from `TYPES` or `mixed`. Hide the tab bar (Immersive layout). Re-roll with "Practice again".

## Exercises

**6.11** Define `ExState` and write the reducer for `mcq` only (pick, next). Unit-test: correct pick increments the score; wrong pick records a miss; picks are ignored after answering.

**6.12** Build `McqView` and the session shell: progress bar, the question, option buttons with the right/wrong colours, feedback panel with a Continue button, results screen.

**6.13** Add `build` (tiles, Clear, Check, retry once) and `type` (input, Check, retry once). Test the reducer for both, including the retry rule.

**6.14** Add `ensureDue` to the store and call it for `missed` at the end. Show "N missed items added to your review".

**6.15** Wire the unit page: each exercise type button starts `/practice/:unitKey/:type` with the count of eligible questions and a Mixed button. On the Practice page offer Mixed across everything you've learned (fall back to all items if the deck is small).

**6.16** Run each type on your phone and check: audio starts from a tap, the keyboard doesn't hide the Check button, and tiles are easy to tap. Fix what's awkward.
