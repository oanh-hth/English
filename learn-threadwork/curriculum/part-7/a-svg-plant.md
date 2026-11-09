# Part 7a: Drawing the plant with SVG

*[Part 7: The garden and motivation](README.md) · section a*

Part 7 makes Threadwork motivating: the plant, the treats, the inspiration wall, the weather in the sky and the little celebrations. First, the plant itself, drawn with SVG straight from the growth number.

## Separate "what" from "how"

Drawing code gets messy fast. Split it in two:

1. a pure function decides **what** to draw: how many leaves, flowers and fruits, and whether the fruit is ripe;
2. a component decides **how** to draw it.

```ts
plantParts(58, "tomato")   // { seed: false, leaves: 9, flowers: 2, fruits: 0, ripe: false }
```

The first part is easy to test exactly. The second you can restyle as often as you like without breaking anything.

## The rules

Read them in the starter comment: leaves appear as the stem grows; flowers from 50%; fruits from 65%, and each new fruit replaces a flower; at 100% everything is ripe. Each variety has its own maximum number of fruits.

## Drawing many of something

```tsx
{Array.from({ length: parts.leaves }, (_, i) => <ellipse key={i} data-part="leaf" … />)}
```

`Array.from({ length: n }, fn)` builds an array of `n` items from a function of the index. Use the index to place each one: alternate sides with `i % 2`, and climb the stem with `i / n`.

## Coordinates

With `viewBox="0 0 200 260"` you draw in a 200 × 260 space, and CSS scales it to fit the card. SVG's `y` grows **downwards**: the pot is near `y = 210`, and the top of a tall plant near `y = 30`. A stem that grows with the plant is a path whose top depends on growth:

```tsx
const top = 200 - (14 + growth * 1.62);
<path d={`M100 200 Q110 ${(200 + top) / 2} 100 ${top}`} stroke="#3E7D3A" fill="none" />
```

`data-part` attributes name each piece. Tests count them, and in 7d you'll animate them with CSS.

## Describe the picture

The plant is an image, so give the `<svg>` `role="img"` and a label that says what it shows: "Tomato, 58% grown, Flowering". VoiceOver users get the same reward as everyone else.

## Read more
- SVG basic shapes (MDN): <https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes>
- `Array.from` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from>
- Accessible SVG: <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/img_role#svg_and_roleimg>

---

## Exercises 7.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 7.1: Draw the plant with SVG

**Edit:** `app/client/src/components/Plant.tsx` · **Tests:** `tests/part-7/7.1-plant.test.tsx` · **Run:** `npm run ex 7.1`

Write `plantParts` and draw `Plant`: a labelled `<svg role="img">`, a pot, and elements with `data-part="seed" | "leaf" | "flower" | "fruit"` (`data-ripe` on ripe fruit). Make it as pretty as you like; the tests only count parts. Try the growth slider in the playground.

---

[← Part 7 overview](README.md) · [7b Garden controls and the treat shop →](b-garden-and-treats.md)
