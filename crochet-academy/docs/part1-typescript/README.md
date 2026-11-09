# Part 1 · TypeScript and the data model

The heart of the app is a small data model: a **chart** has **rows**, a row has **items**, an item is a stitch repeated some times or a group of items repeated. In this part you describe that model with TypeScript types and write the functions that work on it: count a row, write it as text, spot a miscount, and edit a chart without breaking it.

There are no screens to build here. Instead you build the *engine* that every later part uses. Because these are plain functions, the tests are fast and the feedback is immediate, which makes this a good place to learn TypeScript.

## Sections
* [a · Describing a pattern with types](a-describing-a-pattern-with-types.md) → exercises 1.1, 1.2
* [b · Small functions over the model](b-small-functions-over-the-model.md) → exercises 1.3, 1.4, 1.5
* [c · Editing without mutating](c-editing-without-mutating.md) → exercise 1.6

## The app after this part
Open the editor (`npm run dev`, click **New chart**): the *Written pattern* panel shows the text for each row, written by your `rowText`. The stitch-count hints work as soon as rows have stitches (part 3 lets you add them).

## Finish the part
Run `npm run learn` and tick the items for this part. Write your answers to the review questions in `notes/part1.md`, then do the milestone.

### Review questions
1. What does "narrowing" mean? Show it with the `Item` type.
2. Why is a `Map` safer than a plain object for `getStitch`?
3. What is the difference between `toBe` and `toEqual` in a test?
4. Give two ways `chartOps` could accidentally change its input.
5. What does the return type `value is StitchId` promise?
