# Build Speak Natural: a full stack course

This course teaches you to build a complete English-learning app: **Node.js, TypeScript and React**, from an empty folder to a deployed, installable, offline-capable app. It follows the format of [Full Stack Open](https://fullstackopen.com): numbered **parts**, each split into **lessons** (a, b, c, d), with **exercises** at the end of every lesson. Every exercise adds to the **same project**, so when you finish Part 9 you have the finished app.

You already own a finished version of the app: the original phrase trainer, now stored in [`../legacy-v1/`](../legacy-v1/) (the repository root now holds the newer *Listen & Learn* app). File names in these lessons (`app.js`, `data.js`, `units-ui.js`, ...) refer to the files inside `legacy-v1/`. It is your **reference**, not your starting point: you build your own version in a new project.

## How a part works

1. **Read the lessons in order.** Each lesson explains the ideas with code you can try.
2. **Do the exercises as you go.** They are numbered by part (`3.1`, `3.2`, ...). Commit after each one.
3. **Finish the part's checkpoint.** Each part ends with a checklist and a git tag (`git tag part3`). The app should work at every checkpoint.
4. **Compare with the reference.** Only after your own version works, read the matching files in the finished app listed in the part.

If an exercise is stuck for more than 30 minutes: re-read the lesson, then look at the reference file, close it, and write your own.

## The parts

| Part | Title | The app can now... |
|------|-------|--------------------|
| [0](part0/README.md) | Getting ready | run an empty React + TypeScript project |
| [1](part1/README.md) | TypeScript and the content | load and validate real phrases and words |
| [2](part2/README.md) | React basics: browsing | browse topics and phrases on a phone-sized screen |
| [3](part3/README.md) | State, events and audio | teach new phrases with audio (Learn session) |
| [4](part4/README.md) | Spaced repetition and saving | schedule reviews and remember your progress |
| [5](part5/README.md) | Routing and the app shell | navigate like a real app with tabs and pages |
| [6](part6/README.md) | The exercise engine | generate practice questions and role-plays |
| [7](part7/README.md) | Your own content | add, edit, delete, export and import items |
| [8](part8/README.md) | Offline, tests and deployment | install on your phone, work offline, ship from GitHub |
| [9](part9/README.md) | Going further | an AI helper behind a server, plus ideas |

Plan on **6 to 10 weeks at about 5 hours a week**. Parts 0 to 4 give you a working study tool.

## What you need

- A computer (macOS, Windows or Linux), a code editor (VS Code is a good choice) and a GitHub account.
- An iPhone or Android phone on the same Wi-Fi to test on a real device.
- No prior React or TypeScript. Basic JavaScript (variables, functions, arrays, objects) helps.

## Files in this folder

- [`app-spec.md`](app-spec.md): what the finished app does and its data shapes. Read it in Part 0.
- [`PROGRESS.md`](PROGRESS.md): tick off exercises and checkpoints.
- `sample-data/`: real phrases, words and a role-play as JSON, for your exercises.
- `exercises/`: starter code with **automated tests** for Part 4 (scheduler) and Part 6 (answer helpers). Run `npm install && npm test` inside it.
- `solutions/`: reference answers for those two. Look only after you have tried.

## Ground rules

- Use your **own project folder** (`speak-natural`), separate from this repo.
- Never put an API key or `.env` file in git. Part 8 explains why in detail.
- Phrases in the sample data were written by an AI and have not been reviewed by a native speaker. Part 7 teaches you how to fix them.
