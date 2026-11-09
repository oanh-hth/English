# Part 7d: Weather, motion and celebrations

*[Part 7: The garden and motivation](README.md) · section d*

The last touches make the garden feel alive: a sky that follows the real weather and time of day, a plant that sways, and a celebration when you earn a badge.

## A scene from data

The server (Part 8) tells you the weather: sun, cloud, rain, snow or wind, and whether it's day. `sceneFor` turns that into what to draw: `"stars"`, `"moon"`, `"clouds"`, `"rain"`… plus two consequences. Bees and butterflies only come out on dry days, and **rain waters the plant**, so it can't look thirsty. The given `Sky` component draws whatever your function decides. That's the same "what vs how" split as 7a.

When the weather is unknown (no location set, or offline), fall back to sunny, and use the clock for day and night.

## Animation with CSS

CSS animations need no JavaScript:

```css
@keyframes sway { 50% { transform: rotate(1.6deg); } }
.plant { transform-origin: 50% 80%; animation: sway 5s ease-in-out infinite; }
```

`transform-origin` is the point it turns around: near the pot, so the plant sways from its base. Give leaves their own gentle flutter, and fruit a swing from its stem. Different durations and `animation-delay`s stop everything moving in lockstep.

Two SVG details:

- `transform-box: fill-box` makes `transform-origin` relative to the shape itself, instead of the whole drawing.
- **A CSS `transform` replaces an element's SVG `transform` attribute.** If a leaf is positioned with `transform="rotate(…)"` and you also animate its `transform` in CSS, the CSS wins and the leaf jumps out of place. Put the position on a wrapping `<g>`, and animate the element inside it.

## Respect "reduce motion"

Some people get dizzy from moving things, and turn on *Reduce Motion* on the iPad (Settings → Accessibility → Motion). Wrap your animations:

```css
@media (prefers-reduced-motion: no-preference) {
  /* animations here */
}
```

## Celebrations that clean up after themselves

When you earn a badge, a small toast appears and fades after a few seconds. The hook compares the badges from the previous render with the current ones. Keep the previous stats in a ref, and use `newBadges` from 2.4. The first render must not celebrate badges you already had. Each toast gets a timer; clear them all when the component unmounts, as with the focus timer.

## Read more
- Using CSS animations (MDN): <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations>
- `prefers-reduced-motion` (MDN): <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>
- `transform-box` (MDN): <https://developer.mozilla.org/en-US/docs/Web/CSS/transform-box>

---

## Exercises 7.7–7.9

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 7.7: The sky around the plant

**Edit:** `app/client/src/garden/scene.ts` · **Tests:** `tests/part-7/7.7-scene.test.ts` · **Run:** `npm run ex 7.7`

Write `sceneFor(weather, isDay, hour)`: the sky, the parts in order, pollinators, watered, and a label like "Rain · Night".

### 7.8: Animate the plant with CSS

**Edit:** `app/client/src/styles.css`

At the end of `app/client/src/styles.css` there is a marked spot for this exercise. Write keyframes that make the plant sway from its base, the leaves (`[data-part="leaf"]`) flutter, and the fruit (`[data-part="fruit"]`) swing. Wrap everything in `@media (prefers-reduced-motion: no-preference)`. If leaves jump out of place, re-read the note about SVG `transform` above and adjust your `Plant` from 7.1.

Check it on the Garden page, then turn on *Reduce Motion* (on the iPad, or in your computer's accessibility settings) and check that it stops.

This exercise has no automatic tests. Tick it when you've done it (change `[ ]` to `[x]`), and `npm run progress` counts it:

- [ ] **7.8** Animate the plant with CSS

### 7.9: Badge toasts

**Edit:** `app/client/src/hooks/useBadgeToasts.ts` · **Tests:** `tests/part-7/7.9-badge-toasts.test.ts` · **Run:** `npm run ex 7.9`

Write `useBadgeToasts(stats, ms)`: a toast for each newly earned badge (none on the first render), each disappearing after `ms`, `dismiss(id)` to close one, and no timers left after unmounting. Finish a Critical task and watch for "Big push".

---

[← 7c The inspiration wall](c-inspiration.md) · [Part 8: A Node.js server →](../part-8/README.md)
