# Part 5b: Decision cards

*[Part 5: The decision log](README.md) · section b*

Each decision is shown as a card: what the task was, when, the topic, what happened and what you decided. In this section you build it with the HTML elements made for this kind of content.

## Semantic HTML

```tsx
<article aria-labelledby={id}>
  <header><h3 id={id}>{d.title}</h3><time dateTime={d.doneAt}>{d.doneAt}</time></header>
  <dl>
    <dt>Result</dt><dd>{d.result}</dd>
    <dt>Decision</dt><dd>{d.decision}</dd>
  </dl>
</article>
```

- `<article>` is a self-contained piece of content. Named by its heading, it becomes something people can jump between.
- `<time dateTime>` gives machines the exact date, whatever text you show.
- `<dl>`, `<dt>`, `<dd>` is a description list: label/value pairs, exactly what Result/Decision is.

The right elements give you accessibility, sensible default styles and good tests for free.

## Unique ids: `useId`

`aria-labelledby` needs an id, and there are many cards on the page. `useId()` gives each component instance its own stable id:

```tsx
const id = useId();
```

Don't build ids from titles: two tasks can have the same title.

## Line breaks in text

A result written in a textarea may have line breaks. HTML collapses them unless you say otherwise. CSS `white-space: pre-line` keeps them (already in `styles.css`).

## The category as a shortcut

The category pill is a button: tap "React" on any card to see all your React decisions. The card doesn't filter anything itself; it calls `onCategory(id)` and the log decides. Give it a name that says what it does: "Show all React decisions".

## Read more
- `<article>` (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/article>
- `<dl>` (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dl>
- `useId`: <https://react.dev/reference/react/useId>

---

## Exercises 5.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 5.2: DecisionCard

**Edit:** `app/client/src/components/DecisionCard.tsx` · **Tests:** `tests/part-5/5.2-decision-card.test.tsx` · **Run:** `npm run ex 5.2`

Build `DecisionCard`: an `<article>` named by its `<h3>`, a `<time>`, the category as a button ("Show all … decisions"), Result and Decision in a `<dl>`, and *Edit*.

---

[← 5a Filtering by category](a-filters.md) · [5c Putting the log together →](c-the-decision-log.md)
