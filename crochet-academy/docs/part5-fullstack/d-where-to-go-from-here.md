# 5d · Where to go from here

Congratulations: if every exercise is green, you built the logic of a full-stack TypeScript application yourself: a typed data model, a pattern parser, an editor with state management and SVG drawings, a validated and persistent REST API, a typed client with a data hook, and an image-based algorithm.

## Check the whole thing
1. `npm run learn` shows every exercise ticked. Tick the notes and milestones too.
2. `npm run typecheck` is clean.
3. `npm run dev`, then **reload** the page: the notice about saving in the browser is gone.
4. Import the example pattern. Import a photo. Edit a chart in both modes, press **Save**, go back, open it again, delete it.
5. Stop the server, start it again: the charts are still there.

## Build for production
```bash
npm run build         # builds the client into dist/
npm run dev:server    # the server also serves dist/ on http://localhost:3001
```

## Stretch projects
Each of these is a good project and uses what you learned:

* **Draggable outline.** The photo importer detects the piece automatically and has no way to correct it. Add three drag handles (centre, right edge, bottom edge) to the canvas using pointer events, and recompute the profile as they move. The original app in `../crochet/app.js` does this.
* **Undo and redo.** Wrap `chartReducer` in a *history reducer* that keeps `past`, `present` and `future`. Because your reducer is pure and immutable, this is a small change.
* **Edit stitches in place.** Let the user click a chip to change its count or remove it (`removeItem` already exists).
* **Yarn colours.** Add a colour picker per row (`setColor` already exists in the reducer).
* **A database.** Replace the JSON file with SQLite behind the same `ChartRepository` interface and see that no route changes.
* **Share validation.** Use the same validator on the server and in the client's forms.
* **End-to-end test.** Add a Playwright test that creates, saves and deletes a chart through the UI.
* **Deploy it.** Run it on a small server or a platform that runs Node.

## Habits worth keeping
* Write the test (or at least the example) first.
* Keep calculations in pure functions and keep components thin.
* Make impossible states unrepresentable: unions instead of booleans.
* Check input at the edge, once.
* Hide storage and I/O behind small interfaces so they can be replaced and faked.
* Return new objects instead of mutating.

Finish by writing your answers to the [part 5 review questions](README.md) in `notes/part5.md`, and tick the final milestone. Well done!
