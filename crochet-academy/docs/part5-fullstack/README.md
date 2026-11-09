# Part 5 · Full stack and the finish

You have a server and you have an editor. In this last part you connect them, and then add the final feature of the original app: creating a chart from a **photo** of a finished piece.

You will write a typed API client, a data hook, a small signal-processing algorithm and a generator for circle patterns. When the tests are green, the app is complete.

## Sections
* [a · Talking to the API](a-talking-to-the-api.md) → exercise 5.1
* [b · Data hooks](b-data-hooks.md) → exercise 5.2
* [c · Algorithms and photos](c-algorithms-and-photos.md) → exercises 5.3, 5.4
* [d · Where to go from here](d-where-to-go-from-here.md)

## The app after this part
**The finished app.** Charts are saved on your own server. You can import a written pattern, import a photo of a round piece, edit the chart as rows or rounds, and everything survives a restart.

## Finish the part
Tick the items with `npm run learn`, write your answers in `notes/part5.md`, and do the milestone: reload the page (so the app switches from browser storage to your server), import a pattern, import a photo, edit and save; then restart the server and see that your charts are still there.

### Review questions
1. Why does `useCharts` wait for the server *before* updating its state in `create`?
2. What causes an endless render loop when an object is a hook dependency, and how do you avoid it?
3. Why is `'loading' | 'ready' | 'error'` better than three booleans?
4. In `estimateRounds`, why subtract a moving average before looking for waves?
5. Which exercise in the whole course taught you the most? What would you teach a friend about it?
