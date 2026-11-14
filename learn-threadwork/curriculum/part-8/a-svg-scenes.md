# Part 8a: Animated SVG scenes

*[Part 8: Themes, stickers and folders](README.md) · section a*

Threadwork works. Part 8 makes it a place you like to sit in: an animated scene behind your tasks, stickers on your decisions, and a shelf of folders to keep them in. First, the scenes.

## SVG is a drawing you can write

An SVG image is text, a list of shapes in a coordinate system:

```svg
<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
  <rect width="1200" height="800" fill="#E8D5BE"/>          <!-- the wall -->
  <rect x="70" y="120" width="420" height="380" fill="#9CC7E0"/>  <!-- a window -->
  <path d="M-40 130 Q0 70 40 130 Z" fill="#2F4F45"/>        <!-- a lamp shade -->
</svg>
```

- `viewBox` sets your own coordinates (here 1200 × 800), whatever size the screen is.
- `preserveAspectRatio="xMidYMid slice"` fills the whole screen like a photo with `object-fit: cover`, cropping the edges on a tall iPad.
- `<g transform="translate(980 40)">` groups shapes and moves them together, which is handy for a lamp you want to swing as one piece.

Open `app/client/src/art/art.ts`. Every scene (coffee shop, cozy room, library, rainy window, night city) is built from rectangles, circles, ellipses and paths. That's all illustration needs.

## Animating with CSS inside the SVG

Each scene carries its own `<style>`. Parts of the drawing get classes, and keyframes move them:

```css
.sc-coffee .lamp { transform-origin: 0 0; animation: cf-swing 6s ease-in-out infinite }
@keyframes cf-swing { 0%,100% { transform: rotate(-2deg) } 50% { transform: rotate(2deg) } }
```

A few habits from the scenes:

- **Prefix every class** (`.sc-coffee …`, `cf-swing`) so two scenes can't fight over the same names.
- **Vary durations and delays** (`animation-delay: -1.3s`). Steam that rises in lockstep looks mechanical; staggered, it looks real.
- **Animate `transform` and `opacity` only.** The browser can do those cheaply, without redrawing the page. That matters on an iPad running all day.
- **Generate repetition.** Forty raindrops are one `Array.from({ length: 40 }, …)` with positions from a little arithmetic, not forty lines of SVG.

## Respect Reduce Motion

```css
@media (prefers-reduced-motion: reduce) { .sc-coffee * { animation: none !important } }
```

Some people feel ill from movement and turn on *Reduce Motion* (iPad: Settings → Accessibility → Motion). Every scene stops completely for them.

## Readable over any picture

Text on top of an illustration is hard to read. The app puts the content on a frosted panel instead:

```css
.view { background: color-mix(in srgb, var(--paper) 90%, transparent); backdrop-filter: blur(8px) }
```

The scene shows around the edges and softly through the panel, and the text keeps its full contrast.

## Injecting SVG strings in React

The scenes are strings, so the given `Backdrop` and `SceneThumb` components insert them with `dangerouslySetInnerHTML`. The name is a warning: inserting HTML from a string skips React's protection against script injection. It's safe here only because the strings are **ours**, written in the repository. Never do it with anything a user typed or a server sent.

## A radio group of pictures

Choosing a theme is choosing one from a set: a **radio group**. You can use real `<input type="radio">` elements (you will in 8.4), or, for big picture cards, buttons with `role="radio"` and `aria-checked`. Then the keyboard should work like native radios:

- one **tab stop** for the whole group: only the checked card has `tabIndex={0}`, the others `-1`;
- **arrow keys** move the choice and the focus, wrapping around at the ends.

This pattern is called a **roving tabindex**.

## Read more
- SVG tutorial (MDN): <https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial>
- `preserveAspectRatio` (MDN): <https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio>
- CSS animations (MDN): <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations>
- `prefers-reduced-motion` (MDN): <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>
- Radio group pattern (WAI-ARIA): <https://www.w3.org/WAI/ARIA/apg/patterns/radio/>
- `dangerouslySetInnerHTML`: <https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html>

---

## Exercises 8.1–8.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 8.1: ThemePicker

**Edit:** `app/client/src/components/ThemePicker.tsx` · **Tests:** `tests/part-8/8.1-theme-picker.test.tsx` · **Run:** `npm run ex 8.1`

Build `ThemePicker`: a `radiogroup` named "Background" with a `role="radio"` button per theme (preview from `SceneThumb`, then the name), `aria-checked`, a roving `tabIndex`, and arrow keys that wrap. Then switch scenes in Settings, or with the menu in the header.

### 8.2: Draw your own scene

**Edit:** `app/client/src/art/art.ts`

Add a scene of your own to `THEMES` in `app/client/src/art/art.ts`: a beach at sunset, your desk, a train window, anything that makes you want to sit down and work. Use a class prefix, at least two animations with different timings, and the Reduce Motion rule. Keep the important things away from the edges, because `slice` crops them on a tall screen. Check it in Settings, on a phone width and on the iPad.

This exercise has no automatic tests. Tick it when you've done it (change `[ ]` to `[x]`), and `npm run progress` counts it:

- [ ] **8.2** Draw your own scene

---

[← Part 8 overview](README.md) · [8b Stickers →](b-stickers.md)
