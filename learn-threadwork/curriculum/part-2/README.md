# Part 2: The app's logic: dates, a reducer and queries

The app's logic as pure functions: dates, one reducer for every change, and the queries behind the decision log and the weekly summary.

## Sections

- **[2a Pure functions and dates](a-pure-functions-and-dates.md)** · exercise 2.1
- **[2b A reducer for the whole app](b-reducers.md)** · exercise 2.2
- **[2c Queries: the decision log and the weekly summary](c-queries.md)** · exercises 2.3, 2.4

Read the sections in order. Each ends with its exercises; do them before moving on. `npm run progress` shows where you are.

## Knowledge check

Tick each box (change `[ ]` to `[x]`) when you can explain it in your own words. `npm run progress` counts them.

- [ ] I can explain what makes a function pure and why that makes it easy to test
- [ ] I can do date arithmetic in UTC and find the start of a week
- [ ] I can write a reducer with a discriminated union of actions that delegates to smaller functions
- [ ] I can explain why the decision log is derived instead of stored
- [ ] I can combine optional filters and break ties with a clear rule
