Almost there. The core works; these four exercises add the personality and the convenience: **Miso** the cat worries about dates and money, **Misu** the dog asks about forgotten things, items stay where you drop them, you can delete things, and you can import a whole bill without typing.

This part has no new theory, only composition. Every function you need already exists: that is the payoff of small, tested pieces.

## a) Rules first, then the view

The mascots are split in two on purpose. `mascotMessages` (8.1) is a pure function of `items` and `today`: easy to test, no React. `Mascots` (8.2) only displays the result. When you later want to change what the cat says you will touch one file and one test.

The same idea applies to `BillImport` (8.3): it does not know how bills are read or how items are added. It receives `parse` and `onAdd` as props, so a test (or a different app) can plug in anything.

## b) Async UI states

A button that starts a request has at least four states: *idle*, *busy* (disabled, "Reading…"), *done* (show the result) and *failed* (show the error). Write them down before coding. Use `try / catch / finally`: `finally` runs in both cases, which is the right place to switch `busy` off.

## c) Extending your own code

Exercise 8.4 asks you to extend the `App` you wrote in 7.3. Read your own code first, make the smallest change that makes one new test pass, then the next. This is what most real work looks like.
