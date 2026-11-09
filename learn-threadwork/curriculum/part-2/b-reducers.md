# Part 2b: Reducers

*[Part 2: Domain logic: streaks, garden and rewards](README.md) · section b*

The garden changes in four ways: it grows, it shrinks (when you un-finish a task), it is harvested, and you choose the next seed. In this section you write all of that as one **reducer**, the pattern you'll use for the whole app in Part 4.

## Actions

Describe each change as a plain object with a `type`:

```ts
type GardenAction =
  | { type: "grow"; amount: number }
  | { type: "shrink"; amount: number }
  | { type: "harvest"; day: string }
  | { type: "chooseSeed"; kind: PlantKind };
```

This is a **discriminated union**: every member has a `type` field with a different literal value. Code that checks `action.type` gets the right fields for that kind of action.

## A reducer

A reducer takes the current state and an action, and returns the next state:

```ts
function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    case "grow": {
      const total = state.growth + action.amount;       // TypeScript knows action.amount exists here
      return { ...state, growth: Math.min(100, total), extra: state.extra + Math.max(0, total - 100) };
    }
    // …
  }
}
```

Why a reducer, and not four separate functions? Because all the ways the state can change sit in one place. Each change is data (an action) that you can log, test, replay or send to another device. React's `useReducer` (Part 4) is built around exactly this shape.

## Overflow growth

What happens if the plant is at 90% and you finish a Critical task (+40%)? The plant stops at 100%, but the extra 30% shouldn't be lost. It goes into `extra`, and when you harvest, the next seed starts with that head start (at most 99%, so it never starts already ripe).

## Return the same state when nothing changes

Harvesting a plant that isn't ripe does nothing. Choosing a seed you haven't unlocked does nothing. In those cases return **the same object** you received:

```ts
if (state.growth < 100) return state;
```

The tests check this with `toBe`, which compares identity, not contents. React relies on the same rule: if the state object is the same, nothing needs to redraw.

## Unlocking

Plant varieties unlock as you harvest: chili after 1 harvest, lemon after 3, eggplant after 5. When you harvest, count the harvest you are just making. That decides whether your chosen next seed is already unlocked.

## Read more
- Extracting state logic into a reducer: <https://react.dev/learn/extracting-state-logic-into-a-reducer>
- Discriminated unions: <https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions>

---

## Exercises 2.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 2.2: The garden reducer: grow, harvest, unlock

**Edit:** `app/shared/garden.ts` · **Tests:** `tests/part-2/2.2-garden-reducer.test.ts` · **Run:** `npm run ex 2.2`

Write `isUnlocked` and `gardenReducer`. The rules for each action are in the starter comment. Never mutate `state`: build new objects with spread, and a new `harvests` array.

---

[← 2a Pure functions and dates](a-pure-functions-and-dates.md) · [2c Results, treats and badges →](c-rewards.md)
