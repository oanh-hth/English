# Part 7b: Syncing two devices

*[Part 7: Full stack and shipping](README.md) · section b*

Edit on the iPad in the morning, continue on the computer at lunch: that's the point of the server. In this section you write the rules that decide, at any moment, what should travel which way.

## Three timestamps

Each device remembers two numbers, and the server holds a third:

- `localSavedAt`: when this device last changed something
- `lastSyncedAt`: the version both sides last agreed on
- `remoteSavedAt`: the version on the server now

From these, "changed" means newer than the last agreement:

| This device changed | Server changed | Do |
|---|---|---|
| no | no | nothing |
| yes | no | **push** (send ours) |
| no | yes | **pull** (take theirs) |
| yes | yes | **conflict**: ask |

A conflict is rare (you'd have to edit on both while one was offline), but when it happens, guessing would lose work. So the app asks: "Keep this device's copy or the other one?"

## Debounce: wait until you stop

Typing a note title changes the state on every key. Sending the whole state twenty times per word would be wasteful. **Debounce** waits until changes stop for a moment, then sends only the latest:

```ts
const save = debounce((state) => api.putState(state, …), 1200);
save(s1); save(s2); save(s3);   // 1.2 s later: one request, with s3
```

Two extras make it practical: `flush()` sends now (when you leave the page), and `cancel()` forgets the pending call.

The given `useServerSync` hook puts your two functions together: on sign-in it decides push, pull or conflict, after each change it debounces a push, and a 409 from the server becomes the conflict banner.

## Read more
- Debounce (MDN glossary): <https://developer.mozilla.org/en-US/docs/Glossary/Debounce>
- Closures (MDN), how debounce remembers its timer: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures>

---

## Exercises 7.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 7.2: Sync decisions and debounce

**Edit:** `app/shared/sync.ts` · **Tests:** `tests/part-7/7.2-sync.test.ts` · **Run:** `npm run ex 7.2`

Write `decideSync` and `debounce` (with `flush` and `cancel`). Then sign in on two browsers and watch changes move between them.

---

[← 7a Talking to the server](a-api-client.md) · [7c Signing in →](c-sign-in.md)
