# Part 0b: How a web app like Threadwork works

*[Part 0: Fundamentals](README.md) · section b*

Before writing code, it helps to know what the pieces of a web app are and how they talk. Threadwork has the same shape as most modern web apps.

## The browser runs the app

When you open Threadwork, the browser downloads HTML (an almost empty page), **JavaScript** (the program: React builds every button and list), and CSS (how it looks). This is a **single-page application**. The page loads once; moving from *Tasks* to *Decisions* only changes the part after the `#` in the address, and JavaScript swaps what's on the screen.

## We write TypeScript, the browser runs JavaScript

You write `.ts` and `.tsx` files. TypeScript is JavaScript with **types**: you say a task's `complexity` is `"simple" | "complex"`, and the editor warns you the moment you write `"hard"`. A tool called **Vite** translates TypeScript to JavaScript while you work and reloads the page when you save.

## The server keeps your data safe

Your iPad and your computer each have their own browser storage. To share data between them, there is a **server**: a Node.js program (Part 6) that creates accounts, checks passwords and saves each person's data in a file. The browser talks to it with **HTTP requests**:

```
browser                                   server (Node.js + Express)
   |  POST /api/auth/login {email, password}  |
   | ---------------------------------------> |  checks the password hash
   |  200 {token}                              |
   | <--------------------------------------- |
   |  PUT /api/state {state, savedAt}          |
   | ---------------------------------------> |  writes data/state/<user>.json
```

Data travels as **JSON**: `{"title":"Choose a router","complexity":"complex"}`.

## Shared code

Some rules matter on both sides. "An outcome needs a result, a decision and a real category" is checked in the browser's form *and* by the server before saving. That code lives in `app/shared/` and is written once.

## The data

Everything Threadwork knows fits in one object:

```ts
interface Task {
  id: string;
  title: string;
  complexity: "simple" | "complex";
  status: "todo" | "done";
  due: string | null;          // "2026-11-20"
  createdAt: string;
  doneAt: string | null;
  outcome: Outcome | null;     // complex tasks, once done
}

interface Outcome { result: string; decision: string; category: string }

interface AppState { tasks: Task[] }
```

The decision log isn't stored separately. It is *computed* from the tasks: every done task that has an outcome is a decision. You'll write that query in Part 2.

Every change (add a task, tick it, record an outcome) is described as an **action**, like `{ type: "complete", id: "t1", today: "2026-11-14" }`. A function called a **reducer** takes the state and the action and returns the new state. React shows it, it's saved on the device, and a moment later it's sent to the server.

Read `app/shared/types.ts` and `app/shared/categories.ts` now. You'll know every field by the end of Part 1.

## Read more
- How the web works (MDN): <https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works>
- JSON (MDN): <https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON>
- HTTP overview (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview>

---

## Exercises 0.3

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 0.3: Draw the journey of a decision


On paper, or with Apple Pencil in any drawing app, draw the journey of one decision. Start at you typing the result into a form. Follow it through the reducer, React, the device's storage, the server and its data file, and end with your other device showing it in the decision log. Label each arrow with what travels on it. Keep the drawing; at the end of Part 7, compare it with what you built.

This exercise has no automatic tests. Tick it when you've done it (change `[ ]` to `[x]`), and `npm run progress` counts it:

- [ ] **0.3** Draw the journey of a decision

---

[← 0a How this course works](a-how-this-course-works.md) · [Part 1: TypeScript and the task model →](../part-1/README.md)
