# Part 4 · The Node API

The editor works, but its charts vanish when you close the tab. In this part you build the **server**: a small Node application with a REST API that validates what clients send, stores charts, and saves them to a file so they survive a restart.

You will meet the ideas every backend developer needs: never trusting input, hiding storage behind an interface, HTTP status codes, middleware, and asynchronous file access. And because the server is built from small tested pieces, you can build all of it without ever opening a browser.

## Sections
* [a · Validating input](a-validating-input.md) → exercise 4.1
* [b · The repository and the routes](b-the-repository-and-the-routes.md) → exercises 4.2, 4.3
* [c · Saving to disk](c-saving-to-disk.md) → exercise 4.4

## The app after this part
A real API on port 3001: create, list, read, update and delete charts with `curl`, saved in `data/charts.json`. (The browser still saves in `localStorage` until part 5.)

## Finish the part
Tick the items with `npm run learn`, write your answers in `notes/part4.md`, and do the milestone: use the API with `curl` and restart the server to prove nothing is lost (commands in [4c](c-saving-to-disk.md)).

### Review questions
1. Why is a request body typed `unknown` and not `any`?
2. What is the difference between a 400 and a 404, and who is "at fault" in each?
3. Why does the repository return copies of what it stores?
4. What can go wrong if two saves run at the same time, and how does a promise chain fix it?
5. Why does `createApp` not call `listen`?
