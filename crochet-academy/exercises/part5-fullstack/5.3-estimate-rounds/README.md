# 5.3 · Count rounds from a photo (capstone algorithm)

**Concepts:** turning a spec into code, arrays and loops, a taste of signal processing (detrending and a one-frequency Fourier transform), testing numeric code with synthetic data.

**File to edit:** `src/core/estimateRounds.ts`

## The idea
Walk from the centre of a crocheted circle to its edge and note how bright the picture is. Each round of stitches is a little ridge, so brightness ripples up and down once per round. **The number of ripples is the number of rounds.**

The recipe is written as five numbered steps in the comment above `estimateRounds`. It is a full algorithm; type it in step by step and use the tests to find slips. `movingAverage` is the warm-up.

The importer takes **twelve** such lines, one per slice of the circle, and `estimateRounds` receives all of them. One line can be fooled by a shadow; twelve lines voting together cannot. You add up the evidence from every line for each candidate wave count and pick the winner.

Lighting makes one side of the photo brighter than the other. That slow drift would drown out the ripples, which is why step 3 subtracts a moving average first.

## Where it is used
The photo import in the original app (`crochet/app.js`) uses this idea. Compare your version with `estimateRounds` there when you are done.

## Done when
`npm run learn test 5.3` is green. Next, 5.4 generates the chart from the round count. Section 5c explains how the two fit together.
