# Part 7c: The inspiration wall

*[Part 7: The garden and motivation](README.md) · section c*

The inspiration wall is the page you open when you need a push: quotes that move you, the goals you're working towards, and your **wins**, the tasks you finished. In this section you build its reducer and component.

## Ordering by hand

Pins appear in the order you choose. Moving one up means swapping it with its neighbour, in a copy of the array:

```ts
const pins = [...state.pins];
[pins[i], pins[j]] = [pins[j], pins[i]];        // swap by destructuring
```

At the edges (moving the first one up, the last one down) nothing happens: return the same state. In the component, disable those buttons, so nobody presses a button that can't work.

## A union in the UI

A pin is either a quote or a goal:

```ts
type Pin = { id: string; type: "quote"; text: string; author: string } | { id: string; type: "goal"; text: string };
```

Checking `p.type` tells TypeScript which one you have, so `p.author` is only allowed on quotes, the same discriminated union as reducer actions, now used in JSX:

```tsx
{p.type === "quote" ? <blockquote>{p.text}{p.author && <cite>{p.author}</cite>}</blockquote> : <p>Goal: {p.text}</p>}
```

Use the real elements: `<blockquote>` for a quote, `<cite>` for who said it.

## Quote of the day

The Today page shows one quote, a different one each day, but the same one all day. Use the day of the month to pick: `quotes[day % quotes.length]`. It's simple, predictable and testable, which matters more here than being random.

## Wins

Wins are your finished tasks, newest first. Nothing new is stored: the wall shows data you already have from another angle. Seeing a list of what you've done is one of the strongest motivators there is.

## Read more
- `<blockquote>` and `<cite>` (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/blockquote>
- Destructuring assignment, swapping (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#swapping_variables>

---

## Exercises 7.5–7.6

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 7.5: Pins reducer and the quote of the day

**Edit:** `app/shared/pins.ts` · **Tests:** `tests/part-7/7.5-pins.test.ts` · **Run:** `npm run ex 7.5`

Write `pinsReducer` (add quotes and goals first, remove, move by one with edges unchanged) and `quoteOfTheDay`.

### 7.6: InspirationWall

**Edit:** `app/client/src/components/InspirationWall.tsx` · **Tests:** `tests/part-7/7.6-inspiration-wall.test.tsx` · **Run:** `npm run ex 7.6`

Build `InspirationWall`: the two pin forms, the pins (quotes as `<blockquote>` with `<cite>`, goals as "Goal: …") with *Move up*, *Move down* and *Remove*, and the 12 newest wins. Then pin a quote and a goal that matter to you.

---

[← 7b Garden controls and the treat shop](b-garden-and-treats.md) · [7d Weather, motion and celebrations →](d-weather-and-motion.md)
