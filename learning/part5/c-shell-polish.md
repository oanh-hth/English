# 5c: Tab bar, safe areas, dark mode, accessibility

## The tab bar on a phone

A bottom bar must stay above the iPhone's **home indicator** and be at least 44 px tall per button:

```css
nav[aria-label='Main'] {
  position: fixed; left: 0; right: 0; bottom: 0;
  display: flex;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: var(--card);
  border-top: 1px solid var(--line);
}
nav[aria-label='Main'] a {
  flex: 1; min-height: 58px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  font-size: 11px; color: var(--muted); text-decoration: none;
}
nav[aria-label='Main'] a.active { color: var(--accent); }
main { padding: 14px 16px calc(58px + env(safe-area-inset-bottom, 0px) + 28px); max-width: 640px; margin: 0 auto; }
```

`NavLink` adds the class `active` automatically. The page needs bottom padding so content isn't hidden under the fixed bar.

Use inline SVG icons with `aria-hidden="true"` next to a text label; icons alone aren't enough for accessibility.

## Dark mode

You already use CSS variables. Dark mode is one media query that redefines them (Part 2c). Test: on iPhone, Settings → Display & Brightness. In desktop DevTools: Rendering → "Emulate prefers-color-scheme".

Also set `<meta name="theme-color">` for light and dark so the browser toolbar matches:

```html
<meta name="theme-color" content="#f6f7fb" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0f1115" media="(prefers-color-scheme: dark)" />
```

## Small details that make it feel native

- `-webkit-tap-highlight-color: transparent;` removes the grey flash on tap.
- `touch-action: manipulation;` on buttons avoids the double-tap-zoom delay.
- Reset scroll to the top when the route changes. In React Router, a small component with `useLocation` and `useEffect(() => window.scrollTo(0, 0), [pathname])` does it.
- Update `document.title` per page (`useEffect`) so history entries are readable.
- Respect `prefers-reduced-motion` and don't add animation you don't need.

## Accessibility checklist

- Every interactive element is a real `<button>` or `<a>` and reachable by **Tab**.
- Visible **focus** style (don't remove the outline without replacing it).
- Icon-only buttons have `aria-label`.
- Form inputs have labels (`<label>` or `aria-label`).
- Text contrast at least 4.5 : 1; don't use colour alone to show state (the finished app adds words such as "New" and "In deck").
- Headings are in order (`h1` once per page).
- `aria-live="polite"` on areas that change after an action (toasts, feedback messages) so screen readers announce them.

Try VoiceOver on your iPhone (Settings → Accessibility → VoiceOver) for five minutes. It is the fastest way to learn what your markup really says.

## Exercises

**5.12** Build `Shell` with the fixed tab bar (inline SVG icons + labels), the active state, and the safe-area padding. Verify on a real iPhone that nothing overlaps the home indicator.

**5.13** Hide the tab bar on Learn/Review/Exercise routes with the `Immersive` layout and give those screens a close button that uses `useNavigate(-1)` or links to the unit.

**5.14** Add the `theme-color` tags, tap-highlight and `touch-action` tweaks, scroll-to-top on navigation and a per-page `document.title`.

**5.15** Run a keyboard-only pass of the whole app (Tab, Shift+Tab, Enter, Space), then a five-minute VoiceOver pass. Write down three things you fixed.

**5.16** Compare your shell with the finished app's `#tabs` CSS and `renderTabs`. Then deploy nothing yet, but make sure `npm run build` succeeds and `git tag part5`.
