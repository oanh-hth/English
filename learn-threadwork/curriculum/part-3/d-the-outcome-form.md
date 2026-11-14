# Part 3d: The outcome form

*[Part 3: React components](README.md) · section d*

This is the heart of Threadwork: when a complex task is done, you write down what happened, what you decided, and which topic it belongs to. In this section you build that form.

## Several fields, one validation

Keep each field in state, starting from the existing outcome when you're editing:

```tsx
const [result, setResult] = useState(task.outcome?.result ?? "");
const [decision, setDecision] = useState(task.outcome?.decision ?? "");
const [category, setCategory] = useState(task.outcome?.category ?? "");
```

`?.` reads a field only if the object exists. On submit, don't write the rules again. Use `parseOutcome` from 1.4:

```tsx
const r = parseOutcome({ result, decision, category });
if (!r.ok) { setError(r.error); return; }
onSave(r.value);       // trimmed and checked
```

The form, the reducer and the server all agree on what a complete decision is, because they use the same function.

## Textareas

`<textarea value={result} onChange={…} rows={4} />`. A placeholder can coach the writing: "What happened? What did you find out?" and "What did you decide, and why?". The *why* is what makes a decision useful when you read it months later.

## A grouped menu: `<optgroup>`

Thirty-odd categories in one flat list is hard to scan. Group them:

```tsx
<select value={category} onChange={e => setCategory(e.target.value)}>
  <option value="">Choose a category…</option>
  {GROUPS.map(g => (
    <optgroup key={g} label={g}>
      {groups[g].map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
    </optgroup>
  ))}
</select>
```

`categoriesByGroup()` from 1.2 gives you the groups. On the iPad, Safari shows this as a native picker with group headings.

## A dialog, Escape, and effects

The form opens on top of the list (the app wraps it in an overlay), so give it `role="dialog"` and a name. Escape should cancel. Key presses happen on the `window`, outside React, so listen in an **effect** and clean up:

```tsx
useEffect(() => {
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [onCancel]);
```

The returned function is the **cleanup**. Without it, every time the form opened, one more listener would stay behind.

## Read more
- `<textarea>`: <https://react.dev/reference/react-dom/components/textarea>
- `<select>` and `<optgroup>`: <https://react.dev/reference/react-dom/components/select>, <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/optgroup>
- Synchronizing with effects: <https://react.dev/learn/synchronizing-with-effects>

---

## Exercises 3.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 3.4: OutcomeForm: result, decision, category

**Edit:** `app/client/src/components/OutcomeForm.tsx` · **Tests:** `tests/part-3/3.4-outcome-form.test.tsx` · **Run:** `npm run ex 3.4`

Build `OutcomeForm`: a named dialog with the task title, *Result*, *Decision*, a grouped *Category* menu, *Save decision* (validated with `parseOutcome`) and *Cancel* (and Escape). Editing starts from the saved outcome.

---

[← 3c Lists and composition](c-lists-and-composition.md) · [Part 4: State, hooks and navigation →](../part-4/README.md)
