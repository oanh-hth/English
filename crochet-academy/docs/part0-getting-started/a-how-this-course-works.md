# 0a · How this course works

This course teaches **React, TypeScript and Node** by having you build a real application: a crochet chart maker called *Cozy Hook Nook*. You write a pattern row by row by picking stitches from a list, see it drawn as a chart, paste a written pattern to import it, and even upload a photo of a finished coaster to get a starting chart. The finished version of the app lives in this repository's `crochet/` folder (plain JavaScript). You will rebuild it, properly, with TypeScript, React and a Node server.

## The shape of the course
The course is split into **parts**, like chapters. Each part is split into lettered **sections** (1a, 1b, 1c). A section is a short tutorial: it explains an idea, shows how it is used in the app, and ends with **exercises** where you apply it.

| Part | You learn | The app gains |
|---|---|---|
| 0 | the learning loop | a working project |
| 1 | TypeScript, pure functions, immutability | the pattern model, written pattern, mistake hints |
| 2 | regular expressions, parsing, recursion | importing written patterns |
| 3 | React, reducers, SVG | the editor and the two chart drawings |
| 4 | Node, Express, validation, files | the API that stores your charts |
| 5 | typed `fetch`, hooks, algorithms | the connection to the server and the photo importer |

After part 5 you have the finished app, and you wrote the important parts of it yourself.

## How the exercises work
An exercise is a **stub**: a function in the real app whose body only says "this is not built yet". Next to it is a **test file** that describes exactly what the function must do. The tests fail until your code is right ("red"), then pass ("green"). When all the tests of an exercise pass it ticks itself in your **checklist**, and the matching feature of the app comes alive.

You never have to guess what "done" means: it is when the tests are green.

## The checklist
`npm run learn` prints your progress and saves it in `CHECKLIST.md`. Each part lists, in the order you should do them:

1. *Read the section*, then its exercises (the exercises tick themselves),
2. the part's review questions (you write answers in `notes/`),
3. a **milestone**: you see the new feature working in the running app.

## What you need
* Basic JavaScript: variables, functions, arrays, objects, `if` and loops.
* A computer with **Node 20 or newer** and **git**, and an editor (VS Code is a good choice, because it shows TypeScript errors as you type).
* About 1 to 2 hours per section at a relaxed pace.

You do **not** need to know TypeScript, React or Node already. You will learn each idea just before you use it.

## How to get the most out of it
* **Type the code yourself.** Copying teaches nothing. When the tutorial shows code, retype it and change something.
* **Read the failing test.** A good test tells you what is expected in plain words.
* **Try before you peek.** There are three hints per exercise and a reference solution, but struggling for a while is where the learning happens. Take a hint after about 15 minutes.
* **Commit often.** One commit per exercise gives you a journal of your progress: `git commit -am "1.2 expand"`.
* **Write the review answers.** Explaining an idea in your own words is the quickest way to find out whether you understood it.

Next: [0b · Setup and the learning loop](b-setup-and-the-learning-loop.md).
