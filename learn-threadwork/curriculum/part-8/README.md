# Part 8: A Node.js server

A Node.js server with Express: a REST API, accounts with safe passwords and tokens, data saved in files with conflict checks, and live weather.

## Sections

- **[8a Node.js and Express](a-express.md)** · exercise 8.1
- **[8b A REST API](b-rest-api.md)** · exercise 8.2
- **[8c Accounts and protected routes](c-accounts.md)** · exercise 8.3
- **[8d Saving data on the server](d-storage.md)** · exercise 8.4
- **[8e Calling other services](e-external-apis.md)** · exercise 8.5

Read the sections in order. Each ends with its exercises; do them before moving on. `npm run progress` shows where you are.

## Knowledge check

Tick each box (change `[ ]` to `[x]`) when you can explain it in your own words. `npm run progress` counts them.

- [ ] I can describe a request and response and choose the right status code
- [ ] I can build an Express app with middleware, routers, a 404 and an error handler
- [ ] I handle errors from async handlers in Express 4
- [ ] I can explain salted, slow password hashing and why passwords are never stored
- [ ] I can explain how a signed token proves who you are and why it can't be edited
- [ ] I write files atomically and never trust user input in a file path
- [ ] I can explain optimistic concurrency and a 409 Conflict
- [ ] I can call another API from the server, with a cache and injected fetch
