# Part 2 · Parsing written patterns

People do not type patterns as data. They write things like `Round 3: *2 dc, ch 1* repeat 11 more times (36)`. In this part you teach the app to read such text and turn it into the data model from part 1. That gives the app its **Import pattern** feature, and teaches you regular expressions, scanning text and recursion.

Parsing is a classic exercise because messy input meets precise output, and every rule you add has edge cases. The method is the same each time: **normalise, split, parse the pieces, collect what you could not read**.

## Sections
* [a · Regular expressions and tokens](a-regular-expressions-and-tokens.md) → exercise 2.1
* [b · Groups, depth and recursion](b-groups-depth-and-recursion.md) → exercise 2.2
* [c · Reading whole patterns](c-reading-whole-patterns.md) → exercise 2.3

## The app after this part
On the *My charts* page, **Import pattern** opens a dialog. Paste text (or press *Try an example*), see the rows the parser understood, and create the chart.

## Finish the part
Tick the items with `npm run learn`, write your answers in `notes/part2.md`, and do the milestone: use the importer in the running app.

### Review questions
1. Why does the order of alternatives in a regular expression matter? Use "double treble" versus "double crochet" as the example.
2. Why can't `splitTop` use `.split(',')`?
3. What does `parseToken` do with text it cannot understand, and why does it not throw?
4. What is a look-ahead, and why does every stitch-name pattern end with `(?![a-z])`?
5. You want to support the phrase "repeat from * to end". Which tests would you write first?
