# Part 8: Finishing touches

> Generated from `parts/_theory` and `curriculum.json` by `npm run docs`. Edit those, not this file.

**In this part:** The last features that make it the real Phòng Trữ Đồ: Miso and Misu, drag-to-save, delete and importing a bill from the browser.

Almost there. The core works; these four exercises add the personality and the convenience: **Miso** the cat worries about dates and money, **Misu** the dog asks about forgotten things, items stay where you drop them, you can delete things, and you can import a whole bill without typing.

This part has no new theory, only composition. Every function you need already exists: that is the payoff of small, tested pieces.

## a) Rules first, then the view

The mascots are split in two on purpose. `mascotMessages` (8.1) is a pure function of `items` and `today`: easy to test, no React. `Mascots` (8.2) only displays the result. When you later want to change what the cat says you will touch one file and one test.

The same idea applies to `BillImport` (8.3): it does not know how bills are read or how items are added. It receives `parse` and `onAdd` as props, so a test (or a different app) can plug in anything.

## b) Async UI states

A button that starts a request has at least four states: *idle*, *busy* (disabled, "Reading…"), *done* (show the result) and *failed* (show the error). Write them down before coding. Use `try / catch / finally`: `finally` runs in both cases, which is the right place to switch `busy` off.

## c) Extending your own code

Exercise 8.4 asks you to extend the `App` you wrote in 7.3. Read your own code first, make the smallest change that makes one new test pass, then the next. This is what most real work looks like.

## Exercises 8.1-8.4

Work in `src/`, read the doc comment above each function (it is the specification), and read the tests: they are examples of how your code is used. Check with `npm run check <id>`. Hints are one command away: `npm run learn -- hint <id>`.

### 8.1 What Miso and Misu say

A pure function that looks at the room and returns what the cat (money and dates) and the dog (forgotten things) say today. Pure rules, no UI.

* **Practice:** Composing everything you built
* **Edit:** `src/domain/mascots.ts`
* **Tests:** `tests/part8/mascots.test.ts`
* **Run:** `npm run check 8.1`

<details><summary>Hints</summary>

1. Write Miso's rules as early returns, in the order of the doc comment.
2. Misu uses `dormantList(items, today)[0]` and `idleDays`.

</details>

### 8.2 The Mascots panel

Show the messages from 8.1: one `<article>` per pet with its mood in `data-mood`.

* **Practice:** Rendering a derived list
* **Edit:** `src/client/Mascots.tsx`
* **Tests:** `tests/part8/mascotsComponent.test.tsx`
* **Run:** `npm run check 8.2`

<details><summary>Hints</summary>

1. `aria-label` on an `<article>` gives it an accessible name.
2. No state, no effect: call `mascotMessages` while rendering.

</details>

### 8.3 Import a bill

Paste bill text, read it through the server, review the rows (untick the ones you do not want) and add the rest.

* **Practice:** A small multi-step UI with async calls
* **Edit:** `src/client/BillImport.tsx`
* **Tests:** `tests/part8/billImport.test.tsx`
* **Run:** `npm run check 8.3`

<details><summary>Hints</summary>

1. State you need: the text, the rows, the format, which rows are ticked (a Set of indexes), busy and error.
2. `try/catch/finally` around the await: `finally` is where `busy` goes back to false.
3. Reset `checked` to every index when new rows arrive.

</details>

### 8.4 The finished App

Add the new pieces to your App: pets at the top, drag-to-move that saves, a Delete button for the selected item, and the bill import panel. When this is green, you have the whole app.

* **Practice:** Extending a component you wrote earlier
* **Edit:** `src/client/App.tsx`
* **Tests:** `tests/part8/finalApp.test.tsx`
* **Run:** `npm run check 8.4`

<details><summary>Hints</summary>

1. `move` already exists in `useItems` (7.2): pass it to Room as onMove.
2. The bill panel is shown only when `api.parseBill` exists.
3. Import rows one by one with `await add(...)`; leave `exp` out when it is an empty string.

</details>

## What your app can do now

The finished app.

```bash
npm run server   and   npm run dev   (open http://localhost:5173)
```

## Check yourself

Tick these with `npm run learn -- tick <id>` when you can honestly say yes.

- **8.m1** I imported samples/shopee.txt through the browser
- **8.m2** I moved an item, reloaded the page and it stayed there
- **8.m3** I can name two things I would add next (a real database, photo reading, login, deploying)
