# Part 1: TypeScript and React: the Notes screen

**Goal.** A React app in TypeScript that shows your notes, filters them, speaks them and lets you add new ones. Everything lives in memory for now. There is no server yet.

**You will learn:** TypeScript's type system, React components, props, state, events, controlled forms, unit tests for pure logic, CSS for phones and tablets.

Work in `word-garden/frontend`.

## a. TypeScript essentials

TypeScript is JavaScript plus **types**. The compiler checks them before the code runs and then erases them. Types catch typos, wrong arguments and forgotten cases, and they document the shape of your data.

Scaffold the front end:

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install && npm run dev
```

The ideas you need now:

```ts
type Kind = 'phrase' | 'word';                  // a union of literal values
type Note = {
  id: number; kind: Kind; text: string; meaning: string; example: string;
  stage: number; due: string;                   // 'YYYY-MM-DD'
  note?: string;                                // optional
};

function level(stage: number): 'New' | 'Learning' | 'Familiar' | 'Known' {
  if (stage >= 5) return 'Known';
  if (stage >= 3) return 'Familiar';
  return stage >= 1 ? 'Learning' : 'New';
}
```

- **Unions and narrowing.** `if (note.kind === 'word') { ... }` narrows the type inside the block.
- **`unknown` over `any`.** Data from the outside world (JSON, input) is `unknown` until you check it. `any` switches the compiler off, so do not use it.
- **`strict` mode** in `tsconfig.json` is on by default in the Vite template. Keep it on. `noUncheckedIndexedAccess` makes `array[0]` possibly `undefined`, which matches reality.
- **`type` vs `interface`.** For plain data shapes either works. This course uses `type`.

### Exercises

**1.1.** Scaffold the project as above. Delete the demo content, so `App.tsx` renders only a heading. Commit.

**1.2.** Create `src/types.ts` with `Kind`, `Note` and `Grade = 0 | 1 | 2 | 3` following [`app-spec.md`](../app-spec.md). Create `src/level.ts` with the `level` function above.

**1.3.** Create `src/dates.ts` with `formatDue(due: string, today: string): string` returning `'Today'`, `'Tomorrow'`, `'In 5 days'`, or `'Overdue 2 days'`. Do the date arithmetic in UTC (`Date.UTC(y, m - 1, d)`), because local-time arithmetic breaks twice a year at daylight saving changes. Try it in the browser console.

**1.4.** Add `"noUncheckedIndexedAccess": true` to `tsconfig.app.json`, fix every error without using `!` or `any`, and add the ESLint rule `@typescript-eslint/no-explicit-any: error`. Explain in `NOTES.md` why `!` is risky.

## b. React basics

A React **component** is a function that returns what to draw (JSX). Data flows **down** through props. Changes flow **up** through callbacks. Anything that changes over time lives in **state**.

```tsx
type Props = { note: Note };
export function NoteCard({ note }: Props) {
  return (
    <article className="note">
      <h3>{note.text}</h3>
      <p>{note.meaning}</p>
    </article>
  );
}
```

Rules to internalise:

1. **Lists need keys.** `notes.map(n => <NoteCard key={n.id} note={n} />)`. The key must be stable and unique (the id, never the index).
2. **State is immutable.** Create a new array: `setNotes([note, ...notes])`. Never `notes.push(...)`.
3. **Do not store what you can compute.** If you have `notes` and `query`, the filtered list is a plain variable, not state.
4. **Controlled inputs.** The input's `value` comes from state and `onChange` updates it. React is the single source of truth.
5. **Lift state up** to the nearest component that needs it, no higher.

```tsx
const [query, setQuery] = useState('');
const shown = notes.filter(n => n.text.toLowerCase().includes(query.toLowerCase()));
<input value={query} onChange={e => setQuery(e.target.value)} />
```

### Exercises

**1.5.** Write `NoteCard`: the text large, the meaning, the example in italics, a pill saying Phrase or Word, and the level name from `level()`.

**1.6.** Copy `sample-data/notes.json` into `src/` and render a `NoteList` of `NoteCard`s. The JSON has no `id`, `stage` or `due`, so map each row to a full `Note` (ids from the index, stage 0, due tomorrow). Enable `resolveJsonModule` if needed.

**1.7.** Add a search box and three filter chips (All, Phrases, Words). The filtered list must be a derived value, not state. Search the text, meaning and example.

**1.8.** Write `AddNoteForm`: kind toggle, text, meaning, example. The text is required. Reject a duplicate text (ignore case) with a visible message. On success add the note to the top of the list and clear the form. Keep the notes state in `App` and pass an `onAdd` callback down.

## c. Pure logic with tests, speech and styling

**Separate logic from UI.** Code that only transforms data (no React, no browser) is easy to test and easy to reuse on the server later. You will write four such helpers now, with tests ready for you.

`exercises/` in this course is a small project with failing tests. Run it:

```bash
cd course/exercises && npm install && npm test
```

Open `src/textutil.ts`. Each function throws `TODO`. Replace them one by one until `test/textutil.test.ts` is green. Read the tests first: they are the specification.

**The Speech Synthesis API** speaks text with the device's voices:

```ts
export function speak(text: string, rate = 0.95) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = rate;
  const v = speechSynthesis.getVoices().find(x => /en[-_]US/i.test(x.lang));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
```

iPhones and iPads only allow speech started from a **tap**, so call `speak` inside a click handler. `getVoices()` may be empty on first call, so look the voice up each time you speak.

**CSS for phones and tablets.** Write the phone layout first (mobile first), then add `@media (min-width: 700px)` for iPad. Put colours, radii and fonts in **CSS variables** on `:root` so a theme change is a one-line edit. Respect the iPhone notch and home bar with `env(safe-area-inset-bottom)`. Support dark mode with `@media (prefers-color-scheme: dark)`.

### Exercises

**1.9 to 1.12.** In `exercises/src/textutil.ts` implement `norm`, `plain`, `gapOf` and `used` until all 15 tests pass. Then copy the finished file into `frontend/src/`.

**1.13.** Write a `useSpeech` hook or a `SpeakButton` component that speaks `plain(note.text)` when tapped. Add it to `NoteCard`. Test on your phone.

**1.14.** Write `youglishUrl(text: string): string` returning `https://youglish.com/pronounce/<encoded text>/english/us` and a unit test (spaces become `%20`, `?` becomes `%3F`). Add a link with `target="_blank"` and `rel="noopener noreferrer"` to each card. Explain `noopener` in `NOTES.md`.

**1.15.** Style the app: CSS variables for the palette, cards with rounded corners, a one-column phone layout, and a two-column grid from 700px up. Check it in the browser's device emulator for iPhone and iPad (portrait and landscape).

**1.16.** Add a bottom **tab bar** with four tabs (Garden, Review, Notes, Me) as real `<button>`s with `aria-label`s, fixed at the bottom with `padding-bottom: env(safe-area-inset-bottom)`. Only Notes works for now. Use `aria-current="page"` on the active one.

## Checkpoint 1

- [ ] `npm run build` in `frontend/` succeeds with no TypeScript errors and no `any`.
- [ ] You can add, search, filter and hear notes, in a phone-width window and an iPad-width window.
- [ ] `textutil` tests pass (15 tests).
- [ ] Your layout works in portrait and landscape.

Tag it: `git tag part1`.

**Reference** (after you are done): the reference app's `notebook.js` and `exercises.js` (the same logic in plain JavaScript) and `styles.css`.
