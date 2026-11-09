# Part 0b: How a web app like Threadwork works

*[Part 0: Fundamentals](README.md) · section b*

Before writing code, it helps to know what the pieces of a web app are and how they talk. Threadwork has the same shape as most modern web apps.

## The browser runs the app

When you open Threadwork, the browser downloads three kinds of files:

- **HTML**: the structure. Threadwork's HTML is almost empty: one `<div id="root">` and a script tag.
- **JavaScript**: the program. React runs in it and builds every button and list inside that `<div>`.
- **CSS**: how everything looks.

This kind of app is a **single-page application (SPA)**. The page loads once. After that, moving from *Tasks* to *Garden* doesn't download a new page. JavaScript swaps what's on the screen. The address changes only after the `#` (`#tasks`, `#garden`), which you will handle yourself in Part 4.

## We write TypeScript, the browser runs JavaScript

You write `.ts` and `.tsx` files. TypeScript is JavaScript with **types**: you say that a task's `importance` is one of `"low" | "medium" | "high" | "critical"`, and the editor warns you the moment you write `"urgent"`. Browsers don't understand TypeScript, so a tool called **Vite** translates it to JavaScript while you work, and reloads the page when you save.

## The server keeps your data safe

The app in the browser keeps your tasks in memory and on the device. But your iPad and your computer each have their own browser storage. To share data between them, there is a **server**: a Node.js program (Part 8) that:

- creates accounts and checks passwords
- saves each person's data in a file
- fetches the weather for the garden's sky

The browser talks to the server with **HTTP requests**, the same kind of request the browser makes to load a page:

```
browser                                   server (Node.js + Express)
   |  POST /api/auth/login {email, password}  |
   | ---------------------------------------> |  checks the password hash
   |  200 {token}                              |
   | <--------------------------------------- |
   |  GET /api/state   Authorization: Bearer … |
   | ---------------------------------------> |  reads data/state/<user>.json
   |  200 {state, savedAt}                     |
   | <--------------------------------------- |
```

Data travels as **JSON**: text that looks like a JavaScript object, `{"title":"Call the bank","importance":"high"}`.

## Shared code

Some code is needed on both sides. The rule "a High task grows the plant by 25%" matters in the browser, and the server checks the shape of a task before saving it. That code lives in `app/shared/`. Write it once, use it in both places.

## The repository

```
app/shared/    TypeScript used by both sides (Parts 1, 2, 5–7)
app/client/    the React app (Parts 3–7, 9)
app/server/    the Node.js server (Part 8)
tests/         one test file per exercise
curriculum/    what you're reading
solutions/     reference answers
```

## Where the data lives while the app runs

Inside the browser, all of Threadwork's data is one object, the **app state**:

```ts
interface AppState {
  tasks: Task[];
  garden: GardenState;
  streak: StreakState;
  focusSessions: number;
  notes: Note[];
  resources: Resource[];
  sketches: Sketch[];
  pins: Pin[];
  treats: Treat[];
  claimed: Claimed[];
}
```

Every change, such as adding a task, ticking a resource or saving a sketch, is described as an **action**: `{ type: "addTask", title: "Call the bank", … }`. A function called a **reducer** takes the current state and the action and returns the new state. You'll write these reducers in Parts 2, 4, 5, 6 and 7. React shows the new state, the state is saved on the device, and a moment later it is sent to the server.

Read `app/shared/types.ts` now. Don't try to understand every line. Just notice that the whole app is described there.

## Read more
- How the web works (MDN): <https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works>
- What is JSON (MDN): <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON>
- HTTP overview (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview>

---

## Exercises 0.3

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 0.3: Draw how Threadwork's parts talk to each other


On paper, or with Apple Pencil in any drawing app, draw Threadwork's architecture: the browser (React, the app state, device storage), the server (Express, the data files), and the weather service. Draw an arrow for each kind of request and write what travels on it (for example "token", "state JSON", "lat/lon"). Keep the drawing; you'll come back to it in Part 9 and see how much of it you built.

This exercise has no automatic tests. Tick it when you've done it (change `[ ]` to `[x]`), and `npm run progress` counts it:

- [ ] **0.3** Draw how Threadwork's parts talk to each other

---

[← 0a How this course works](a-how-this-course-works.md) · [Part 1: TypeScript and the task model →](../part-1/README.md)
