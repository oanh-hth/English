# Part 9c: Signing in

*[Part 9: Full stack and shipping](README.md) · section c*

The first thing you see in Threadwork is the sign-in form. In this section you build it, with the states every async form needs: idle, checking, waiting, error.

## Validate before you send

Check what you can on the device: a plausible email, a long enough password, two matching passwords when registering. It's instant feedback, and fewer pointless requests. Show only the **first** problem: one clear instruction beats a wall of red.

The server checks again anyway. Client checks are for people's convenience, server checks are for safety.

## Waiting

```tsx
setBusy(true);
try {
  await onSubmit(email.trim(), password);
} catch (err) {
  setError(err instanceof Error ? err.message : "Something went wrong");
} finally {
  setBusy(false);
}
```

While waiting, disable the button and change its text to "Please wait…". This stops double submits and shows that something is happening. `finally` makes sure the button comes back, success or failure.

The error message comes straight from your API client (9.1), which got it from your server (8.3): "Email or password is wrong". Three parts of the course working together.

## One form, two modes

Signing in and creating an account differ by one field and some wording. A `mode` prop switches them, and a button switches modes. Use the right `autocomplete` values (`username`, `current-password`, `new-password`). Then Safari and iCloud Keychain offer to fill in and save your password on the iPad.

## Read more
- `autocomplete` for passwords (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete>
- `try…catch…finally` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch>

---

## Exercises 9.3

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 9.3: LoginForm

**Edit:** `app/client/src/components/LoginForm.tsx` · **Tests:** `tests/part-9/9.3-login-form.test.tsx` · **Run:** `npm run ex 9.3`

Build `LoginForm`: the two modes, validation in order, the waiting state, server errors in `role="alert"`, and the switch button. Then create your real account.

---

[← 9b Syncing two devices](b-sync.md) · [9d Offline and on the iPad →](d-offline-and-ipad.md)
