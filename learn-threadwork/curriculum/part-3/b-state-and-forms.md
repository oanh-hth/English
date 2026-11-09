# Part 3b: State and forms

*[Part 3: React components](README.md) · section b*

Components so far only *show* data. To react to typing and clicks, a component needs **state**: values it remembers between renders. In this section you build the quick-capture bar at the top of Threadwork, where you type a task before you forget it.

## `useState`

```tsx
const [text, setText] = useState("");
```

`text` is the current value. `setText` changes it, and React then **re-renders** the component: it calls your function again and updates the screen. Never change state directly (`text = "x"` does nothing useful); always call the setter.

## Controlled inputs

Let React own the input's value:

```tsx
<input value={text} onChange={e => setText(e.target.value)} />
```

Every keystroke calls `setText`, React re-renders, and the input shows the new `text`. Because the value lives in state, you can check it, trim it or clear it at any time.

## Forms

Put the input and the button in a `<form>` and handle **`onSubmit`**. Then both pressing Enter and clicking *Add* submit:

```tsx
function submit(e: FormEvent) {
  e.preventDefault();             // stop the browser from reloading the page
  const title = text.trim();
  if (!title) { setError("Type a task first"); return; }
  onAdd(title);
  setText("");
}

return <form onSubmit={submit}>…<button type="submit">Add</button></form>;
```

## Labels

Every input needs a label: for screen readers, for the iPad's Full Keyboard Access, and for tests (`getByLabelText("Capture a task")`). Connect them with `htmlFor` and `id`:

```tsx
<label htmlFor="capture" className="visually-hidden">Capture a task</label>
<input id="capture" … />
```

The `visually-hidden` class (already in `styles.css`) hides the label on screen but keeps it for assistive technology.

## Showing errors

Put error messages in an element with `role="alert"`, so screen readers announce them. Show it only when there is an error, and clear it as soon as the user types again, so they aren't scolded while fixing it.

## Refs: reaching a DOM element

After adding a task, the cursor should stay in the input so you can type the next one. For that you need the actual `<input>` element. `useRef` gives you a box React fills with it:

```tsx
const input = useRef<HTMLInputElement>(null);
// …
<input ref={input} … />
// later:
input.current?.focus();
```

Refs are also how you'll reach the drawing surface in Part 6.

## Read more
- State, a component's memory: <https://react.dev/learn/state-a-components-memory>
- Reacting to input with state: <https://react.dev/learn/reacting-to-input-with-state>
- Responding to events: <https://react.dev/learn/responding-to-events>
- Manipulating the DOM with refs: <https://react.dev/learn/manipulating-the-dom-with-refs>

---

## Exercises 3.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 3.2: QuickCapture

**Edit:** `app/client/src/components/QuickCapture.tsx` · **Tests:** `tests/part-3/3.2-quick-capture.test.tsx` · **Run:** `npm run ex 3.2`

Build `QuickCapture`: a form with an input labelled "Capture a task" and an *Add* button. It adds trimmed text with Enter or the button, clears the input, and keeps focus there. Empty text shows "Type a task first" in a `role="alert"` element, which disappears when the user types again.

---

[← 3a Components and props](a-components-and-props.md) · [3c Lists and composition →](c-lists-and-composition.md)
