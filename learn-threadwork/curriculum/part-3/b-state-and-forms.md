# Part 3b: State and forms

*[Part 3: React components](README.md) · section b*

The quick-capture bar is where tasks start: type, decide whether it will need a decision, maybe add a due day, press Enter. In this section you learn **state** and **forms**.

## `useState`

```tsx
const [text, setText] = useState("");
```

`text` is the current value. Calling `setText` stores a new value and React **re-renders**: it calls your component again and updates the screen. Never assign to state directly; always use the setter.

## Controlled inputs

Let React own each input's value:

```tsx
<input value={text} onChange={e => setText(e.target.value)} />
<input type="checkbox" checked={complex} onChange={e => setComplex(e.target.checked)} />
<input type="date" value={due} onChange={e => setDue(e.target.value)} />
```

Text and date inputs use `value`; checkboxes use `checked`. An empty date input's value is `""`, so convert it: `due || null`.

## Forms

Handle **`onSubmit`** on the `<form>`, so both Enter and the *Add* button work:

```tsx
function submit(e: FormEvent) {
  e.preventDefault();                // stop the page from reloading
  const title = text.trim();
  if (!title) { setError("Type a task first"); return; }
  onAdd(title, complex ? "complex" : "simple", due || null);
  setText(""); setComplex(false); setDue("");
}
```

Reset all the options after adding, so the next task doesn't silently become complex too.

## Labels and errors

Every input needs a label, for screen readers, for the iPad's keyboard navigation, and for tests (`getByLabelText("Needs a decision")`). Wrapping works for checkboxes: `<label><input type="checkbox" /> Needs a decision</label>`.

Show errors in an element with `role="alert"`, and clear them as soon as the person types again.

## Refs

After adding, the cursor should stay in the title so you can capture the next thing. `useRef` gives you the DOM element:

```tsx
const input = useRef<HTMLInputElement>(null);
<input ref={input} … />
input.current?.focus();
```

## Read more
- State, a component's memory: <https://react.dev/learn/state-a-components-memory>
- Reacting to input with state: <https://react.dev/learn/reacting-to-input-with-state>
- `<input>` in React: <https://react.dev/reference/react-dom/components/input>
- Refs: <https://react.dev/learn/manipulating-the-dom-with-refs>

---

## Exercises 3.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 3.2: QuickCapture

**Edit:** `app/client/src/components/QuickCapture.tsx` · **Tests:** `tests/part-3/3.2-quick-capture.test.tsx` · **Run:** `npm run ex 3.2`

Build `QuickCapture`: a title input, a *Needs a decision* checkbox, a *Due* date, and *Add*. It sends `(title, complexity, due or null)`, resets everything, keeps focus, and shows "Type a task first" for an empty title.

---

[← 3a Components and props](a-components-and-props.md) · [3c Lists and composition →](c-lists-and-composition.md)
