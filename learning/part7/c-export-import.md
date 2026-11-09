# 7c: Export, import and quality flags

`localStorage` lives on one device and disappears if the user clears Safari data or changes phone. An **export file** is a backup; an **import** restores it.

## Exporting: make a file in the browser

No server is involved. Build a `Blob`, give it a temporary URL, and click a hidden link:

```ts
export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url); // free the memory
}
```

On iPhone Safari the file lands in the share sheet/Files. Include a **version number** and a timestamp in the file:

```ts
{ "app": "speak-natural", "version": 1, "exportedAt": "2026-11-09T10:00:00Z", "state": { ... } }
```

## Importing: never trust the file

A user (or someone else) could hand you any file: corrupt, from a newer version, or malicious. The rules:

1. Read it as text (`await file.text()`), then `JSON.parse` in a `try/catch`.
2. Check the **envelope**: `app` matches, `version` is one you understand.
3. **Validate the state** with your validators before touching the store.
4. Only then replace or merge. If anything fails, show **one clear message** and change **nothing**.

```tsx
<input
  type="file" accept="application/json"
  onChange={async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = parseBackup(await file.text()); // pure, tested
    if (!result.ok) return setMessage(result.error);
    dispatch({ type: 'import', state: result.state });
    setMessage('Imported.');
    e.target.value = ''; // allow choosing the same file again
  }}
/>
```

`parseBackup` returns a discriminated union:

```ts
type ParseResult = { ok: true; state: State } | { ok: false; error: string };
```

Choose **replace** or **merge** and explain it to the user. Merge rule example for cards: keep the card with the later `due`... or the one with more `reps`. Any rule is fine if it's documented and tested.

## Why we don't render imported text as HTML

React escapes text by default, so showing an imported phrase is safe. **Never** use `dangerouslySetInnerHTML` with user or imported data: that's how cross-site scripting (XSS) happens.

## Quality flags

The phrases in this course were written by an AI and have not been checked by a native speaker. Give learners a way to **report odd ones**: a "Sounds odd?" button stores the item ID in `flags`. On the Me page a button copies a list of flagged items to the clipboard:

```ts
await navigator.clipboard.writeText(flagged.map(i => `${title(i)} [${i.topic}]`).join('\n'));
```

`navigator.clipboard` needs HTTPS and a user gesture, and can fail; handle the error.

This is how content gets better: collect reports, check against real usage (YouGlish, a tutor), and fix the data.

## Exercises

**7.12** Write `buildBackup(state)` and `parseBackup(text)` with tests: round trip (export then import equals original), wrong `app`, unsupported version, invalid JSON, a card with a bad field.

**7.13** Add **Export** (download) and **Import** (file input) to the Me page. Show success and error messages with `aria-live="polite"`.

**7.14** Test the real flow: export, clear the site data in your browser, reload, import. Everything should return. Try importing a hand-edited broken file; nothing should change.

**7.15** Add flags: a "Sounds odd?" toggle in the detail sheet, a count and a "Copy flagged list" button on Me.

**7.16** Compare with the finished app's `flag`/`copyFlags` actions. Then make a short list: three ways your import could still be abused or break the app, and what you'd do about each. `git tag part7`.
