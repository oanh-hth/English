# 2a: Components and props

## The big idea

In a vanilla app you tell the browser *what to change* ("find this element, set its text"). In React you describe **what the screen should look like for the current data**, and React works out the changes. You write functions that take data and return UI.

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}
```

That function is a **component**. Names start with a capital letter. `{ name }` is a **prop** (input). Use it as `<Greeting name="Anna" />`.

## JSX

JSX looks like HTML inside JavaScript but is not HTML:

- Put JavaScript in braces: `<p>{count + 1}</p>`.
- Use `className`, not `class`; `htmlFor`, not `for`.
- A component returns **one** root element (or a fragment: `<>...</>`).
- Close every tag: `<img />`, `<input />`.
- Attributes with strings: `title="x"`. With values: `onClick={handler}`.

## Typing props

```tsx
import type { Phrase } from '../types';

interface PhraseRowProps {
  phrase: Phrase;
  isNew?: boolean;
  onOpen: (id: string) => void;
}

export function PhraseRow({ phrase, isNew = false, onOpen }: PhraseRowProps) {
  return (
    <button className="item" onClick={() => onOpen(phrase.id)}>
      <span className="grow">
        <h3>{phrase.phrase}</h3>
        <span className="muted">{phrase.meaning}</span>
      </span>
      {isNew && <span className="pill">New</span>}
    </button>
  );
}
```

Observations:

- The props interface is the component's **contract**. The compiler checks every use.
- Handlers are passed **down** as props (`onOpen`); data flows down, events flow up.
- `{isNew && <span>}` renders the pill only when `isNew` is true.

## Composition and `children`

Components can wrap other content:

```tsx
import type { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return <section className="card">{children}</section>;
}

// <Card><PhraseRow ... /></Card>
```

Prefer many small components over one large one. A good test: can you give it a clear name? Does it have one reason to change?

## Components must be pure

Given the same props, a component returns the same JSX. Don't change global variables, write to `localStorage`, or call `Math.random()` while rendering. Side effects belong in event handlers and effects (Part 3).

## Exercises

Work in your project's `src/components/`.

**2.1** Create `PhraseRow` as above (typed props, `isNew` pill). Render it three times from `App` using the first three sample phrases.

**2.2** Create `TopicRow` with props `name`, `phraseCount`, `wordCount`, `inDeck` and `onOpen`. Show a progress bar whose width is `inDeck / (phraseCount + wordCount)` (handle zero).

**2.3** Create `Card` and `Pill` components. Refactor `PhraseRow` and `TopicRow` to use them where it makes sense.

**2.4** Create `Dialogue` with a prop `example: string` that splits `"A | B"` using your `parseExample` from 1.4 and shows two lines labelled A and B. If parsing fails, render only the raw text.

**2.5** Write down in `notes.md`: What is the difference between a prop and a variable inside a component? Why can't a child component change the props it receives? What would you do to let a child "change" something owned by its parent?
