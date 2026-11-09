# 7a: Forms, validation and the bottom sheet

## Forms are state

A controlled form keeps every field in state. Use **one object** for the whole form:

```tsx
interface Draft { word: string; meaning: string; example: string; unit: string }
const [draft, setDraft] = useState<Draft>({ word: '', meaning: '', example: '', unit: 'my' });

function set<K extends keyof Draft>(key: K, value: Draft[K]) {
  setDraft(d => ({ ...d, [key]: value }));
}

<input value={draft.word} onChange={e => set('word', e.target.value)} />
```

`K extends keyof Draft` is a **generic constraint**: `set('word', 3)` won't compile because `word` is a string.

## Validation

Validate in a **pure function** that returns messages per field, so it is testable and the same rules run on submit and on import (7c):

```ts
export function validateDraft(d: Draft): Partial<Record<keyof Draft, string>> {
  const errors: Partial<Record<keyof Draft, string>> = {};
  if (!d.word.trim()) errors.word = 'Add the word';
  if (!d.meaning.trim()) errors.meaning = 'Add a meaning';
  if (d.example && d.example.split(' | ').length > 2) errors.example = 'Use at most two lines separated by " | "';
  return errors;
}
```

UX rules:

- Don't show errors before the user has tried. Show them after submit (or after a field loses focus).
- Put the message **next to the field**, linked with `aria-describedby`, and mark the field `aria-invalid`.
- Disable **Save** only if you also explain why; otherwise keep it enabled and show the errors.
- Prevent duplicates: if the word already exists (case-insensitive), offer to add the existing one to the deck instead of creating a copy.

## IDs for user-created items

Built-in IDs look like `food-12`. Make user IDs that can never collide: a prefix plus time and randomness:

```ts
const newId = () => `c:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
```

Call this in the **event handler**, not during rendering (impure!).

## Item model changes

User items need to know which topic they belong to and that they're custom:

```ts
interface Custom { id: string; kind: 'word' | 'phrase'; unit: string; /* ...fields... */ }
```

Store them in the store as `custom: Custom[]`, and merge with built-in items when you build the list the rest of the app uses (7b).

## The bottom sheet as a component

Make a reusable `<Sheet open onClose>` that handles the things every modal needs:

- Closes on backdrop tap and on **Escape**.
- Locks background scroll while open (`document.body.style.overflow = 'hidden'`, restored in the effect's cleanup).
- Moves **focus** into the sheet when it opens and returns it to the trigger on close. (A dialog element, `<dialog>`, or a library like Radix gives you this for free; try the native `<dialog>` first.)

## Exercises

**7.1** Write `validateDraft` and its tests (empty word, empty meaning, bad example, a good draft).

**7.2** Build a `Sheet` component with Escape and backdrop close, scroll locking and an accessible name (`aria-label` or `aria-labelledby`).

**7.3** Build `AddItemForm`: a Word / Phrase switch, a Topic dropdown (all units plus "My words"), fields for each kind, inline errors and a Save button.

**7.4** Extend the store with `custom` (and reducers `addCustom`, `removeCustom`, `updateCustom`). Make the app's combined list = built-in + custom, so new items appear in the topic list immediately.

**7.5** Add duplicate protection and test it. Then check that a custom phrase appears in the topic's exercises (Part 6 uses the combined list, right?). If it doesn't, find out why.
