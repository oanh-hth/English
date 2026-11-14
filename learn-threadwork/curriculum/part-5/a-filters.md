# Part 5a: Filtering by category

*[Part 5: The decision log](README.md) · section a*

Part 5 builds the **decision log**, the page that turns your finished tasks into something you can learn from. First, the filters: by group (Frontend, Backend, Workflow), by category, and by text.

## The component owns nothing

`DecisionFilters` gets the current filter as a prop and reports every change with `onChange`. It holds no state of its own. The parent (5.3) keeps the filter, and can change it from elsewhere too: clicking a category on a card. A component that only shows props and reports changes is a **controlled component**, just like an `<input value onChange>`.

Always send the **complete** new value:

```tsx
onChange({ ...value, group: g, category: null });
```

Choosing a group clears the category, because "Backend + React" would always be empty.

## Buttons that act like tabs

The group buttons show which one is active with `aria-pressed`:

```tsx
<button aria-pressed={value.group === g} onClick={…}>{g}</button>
```

Screen readers announce "pressed", and CSS can style `[aria-pressed="true"]`. One attribute serves both.

## A menu that shows only what helps

List only categories that have decisions, with their counts: "React (3)". A category with zero decisions is just noise, except when it's the one currently selected. Hiding the selected option would make the menu show the wrong thing.

```ts
CATEGORIES.filter(c => (!value.group || c.group === value.group) && ((counts[c.id] ?? 0) > 0 || c.id === value.category));
```

## Search inputs and landmarks

`<input type="search">` gets a clear button and the right keyboard on the iPad. Wrap the filters in `role="search"` with a name; that's a landmark screen readers can jump to.

## A way back

When any filter is set, show *Clear filters*. People get lost in filters; one button out is kind.

## Read more
- Controlled components: <https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components>
- `aria-pressed` (MDN): <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed>
- Search role (MDN): <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/search_role>

---

## Exercises 5.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 5.1: DecisionFilters

**Edit:** `app/client/src/components/DecisionFilters.tsx` · **Tests:** `tests/part-5/5.1-decision-filters.test.tsx` · **Run:** `npm run ex 5.1`

Build `DecisionFilters`: group buttons with `aria-pressed`, a category menu with counts (hiding empty categories except the selected one), a search input, and *Clear filters*. Every change sends the complete filter.

---

[← Part 5 overview](README.md) · [5b Decision cards →](b-decision-cards.md)
