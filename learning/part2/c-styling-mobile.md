# 2c: Styling and mobile layout

Most learners use this app on a phone. Mobile is not a variation; it's the main case.

## The page itself

In `index.html`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#f6f7fb" />
```

- `width=device-width` makes CSS pixels match the phone's width. Without it phones pretend to be 980 px wide.
- `viewport-fit=cover` lets your page extend under the notch and home bar; you then respect the **safe area** yourself.

## CSS variables for a design system

Define colours and sizes once:

```css
:root {
  --bg: #f6f7fb; --card: #fff; --text: #14161b; --muted: #6b7280;
  --line: #e5e7ee; --accent: #3b6cf6; --accent-soft: #e8eefe;
  --radius: 18px;
  --sab: env(safe-area-inset-bottom, 0px);
}
@media (prefers-color-scheme: dark) {
  :root { --bg: #0f1115; --card: #1a1d24; --text: #f2f4f8; --muted: #9aa1ae; --line: #2a2e38; --accent: #6f93ff; --accent-soft: #1d2a4d; }
}
body { margin: 0; background: var(--bg); color: var(--text); font: 17px/1.4 -apple-system, system-ui, sans-serif; }
```

Dark mode is then free: components use variables, never hard-coded colours.

## Layout with flexbox and grid

```css
.item { display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 14px;
        background: var(--card); border: 1px solid var(--line); border-radius: 16px; }
.grow { flex: 1; min-width: 0; }          /* min-width: 0 lets long text shrink/wrap */
.grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
```

Rules of thumb:

- Design at **390 px wide first**; add `@media (min-width: 700px)` only for extras.
- **Touch targets at least 44 × 44 px.**
- **Inputs at 16 px or larger**, or iPhone Safari zooms in when you focus them.
- Never rely on hover; there is no hover on a phone.
- Don't use fixed pixel widths for containers; use `max-width` and percentages.

## A bottom sheet

The detail view slides up over the list:

```css
.sheet { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: flex-end; }
.sheet .panel { background: var(--bg); width: 100%; max-height: 92dvh; overflow-y: auto;
                border-radius: 22px 22px 0 0; padding: 18px 16px calc(24px + var(--sab)); }
```

`dvh` (dynamic viewport height) accounts for the mobile browser's changing toolbar, unlike `vh`.

In React, render the sheet when `selected` is set:

```tsx
{selected && (
  <div className="sheet" onClick={() => setSelected(null)}>
    <div className="panel" onClick={e => e.stopPropagation()}>
      <PhraseDetail item={selected} />
    </div>
  </div>
)}
```

`stopPropagation` stops a tap *inside* the panel from also closing it.

## Accessibility basics

- Use real `<button>` for actions and `<a>` for links, so keyboards and screen readers work.
- Icon-only buttons need `aria-label="Play audio"`.
- Don't convey meaning by colour alone.
- Text contrast of at least 4.5 : 1.

## Exercises

**2.11** Add the viewport meta tags and a global stylesheet with the variables, including dark mode (`prefers-color-scheme`). Use only variables for colours afterwards.

**2.12** Style `PhraseRow`, `TopicRow`, `Card`, `Pill` and the progress bar so they look like the finished app's lists. Compare with the Topics screen on your phone.

**2.13** Build `PhraseDetail` (meaning, when to use, `Dialogue`, sound tip, tone pill) and show it in a bottom sheet when a row is tapped. Tapping the backdrop closes it.

**2.14** Audit at 390 px with browser DevTools device mode and on your phone: no horizontal scroll, every button at least 44 px, inputs at least 16 px. Fix whatever fails. Toggle your phone's dark mode and fix any unreadable text.

**2.15** Add `aria-label`s to any icon-only button. Tab through the page with a keyboard; every control should be reachable. Then `git tag part2`.
