# Part 7b: Garden controls and the treat shop

*[Part 7: The garden and motivation](README.md) · section b*

The garden page puts your rewards in your hands: you see how far the plant is, harvest it when it's ripe, choose the next seed, and spend your fruit on treats. In this section you build those controls and the treat wallet.

## Progress you can see

```tsx
<label htmlFor="growth">Growth</label>
<progress id="growth" value={Math.round(growth)} max={100} />
```

`<progress>` is the right element for "how far along": the browser draws it and screen readers announce it. Below it, say what's next in words: "7% to fruiting".

## Buttons that explain why they're disabled

A locked seed packet stays visible but disabled, and says how to unlock it: "Unlocks after 3 harvests". In the treat shop, a treat you can't afford is a disabled button that says how much is missing: "4 more fruit". Showing the goal is more motivating than hiding it.

For the treat buttons, keep the accessible name the same in both states ("Claim Lunch out"), so it is always clear what the button is for. The visible text can change.

## Singular and plural

"1 harvest so far", "3 harvests so far". A tiny helper avoids "1 harvests":

```ts
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
```

## The wallet reducer

Your treat functions from 2.3 already know how to claim. The wallet reducer connects them to the app state: harvests come from `state.garden`, claims from `state.claimed`. Adding your own treat keeps the list sorted by cost. Every case either returns a new state or, when nothing happened, the same one.

## Forms with numbers

A number input still gives you a **string** in `e.target.value`. Convert it with `Number(…)` before storing it. The reducer rounds the cost and makes it at least 1, because a component shouldn't be the only thing standing between your data and a cost of −5.

## Read more
- `<progress>` (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress>
- Disabled buttons and accessibility: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/disabled>

---

## Exercises 7.2–7.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 7.2: GardenPanel: harvest and seeds

**Edit:** `app/client/src/components/GardenPanel.tsx` · **Tests:** `tests/part-7/7.2-garden-panel.test.tsx` · **Run:** `npm run ex 7.2`

Build `GardenPanel`: the heading "Tomato · Flowering", the *Growth* progress bar, *Harvest 5 tomatoes* when ripe (or what's missing), the seed packets (pressed, locked with a reason), and the harvest count.

### 7.3: The treat wallet reducer

**Edit:** `app/shared/wallet.ts` · **Tests:** `tests/part-7/7.3-wallet.test.ts` · **Run:** `npm run ex 7.3`

Write `walletOf` and `walletReducer` (claim with your `claimTreat` from 2.3, add custom treats sorted by cost, remove treats).

### 7.4: TreatShop

**Edit:** `app/client/src/components/TreatShop.tsx` · **Tests:** `tests/part-7/7.4-treat-shop.test.tsx` · **Run:** `npm run ex 7.4`

Build `TreatShop`: fruit to spend, a *Claim* button per treat (disabled with "N more fruit" when you can't afford it), a form to add your own treat, and the last 5 claims. Then add a treat you'd really enjoy.

---

[← 7a Drawing the plant with SVG](a-svg-plant.md) · [7c The inspiration wall →](c-inspiration.md)
