# 5c · Algorithms and photos

The original app can build a chart from a **photo** of a finished coaster. It cannot see individual stitches, but it can find out three things: the yarn colour, how many rounds there are, and therefore the pattern of a flat circle. Two pieces of this are yours: counting the rounds (5.3) and generating the pattern (5.4).

## The idea behind counting rounds
Imagine walking from the centre of a crocheted circle to its edge, noting how bright the picture is at each step. Every round is a ridge of stitches, so the brightness **ripples up and down once per round**. The number of ripples between centre and edge is the number of rounds.

The provided code (`src/client/photo/analyse.ts`) finds the piece in the photo and measures that brightness at 120 distances from the centre. That list of 120 numbers is a **profile**. It does this **twelve times**, once for each slice of the circle, so `estimateRounds` receives twelve profiles. Your job: how many waves are in them?

Why twelve? One line from the centre to the edge can be fooled: a shadow, a loose end of yarn, a bump. Twelve lines taken in different directions agree about the rounds but disagree about the accidents, so you **add up their evidence** and the real signal wins. Combining many noisy measurements is one of the most useful ideas in data work.

## Four ideas in about thirty lines
1. **Window** (for each profile). Ignore the middle (a knot) and the very edge (the background): keep from 10% to 94% of the way out.
2. **Detrend** (for each profile). Lighting makes one side brighter, so the profile drifts slowly up or down; that drift is much stronger than the ripples and would hide them. Subtract a **moving average** (each value averaged with its neighbours). What remains is only the fast changes.
3. **Test frequencies.** For each candidate `N` from 5 to 18 (in steps of 0.25), measure how strongly a wave with `N` cycles between centre and edge matches the data, in each profile, and **add the strengths up**. The measure is the *power* of a single frequency: multiply the data by `cos` and `sin` of that wave, add up, and combine: `power = re*re + im*im`. (This is one term of a Fourier transform; using both `cos` and `sin` makes the answer independent of where the first wave starts.)
4. **Pick the best.** The `N` with the largest total power wins; round it.

A **Hann window** (a smooth bump from 0 up to 1 and back to 0) fades the ends of the data in and out, which stops sharp cut-offs from creating false ripples.

## Testing with synthetic data
How do you test code that analyses photos, without photos? **Make your own data** where you know the answer: a profile that is exactly a wave with `N` cycles, plus a drift, plus a little noise. If `estimateRounds` finds `N`, the algorithm works. The tests do this for 6 to 15 waves, with different phases and lengths, and for twelve profiles that each show the wave differently (some of them pure junk). Testing numeric code with data you generated is a powerful trick; keep it in mind.

## Generating the circle
Once you know the number of rounds and the stitch, the pattern of a flat circle follows a rule: every round adds the same number of stitches (6 for single crochet, 8 for half doubles, 12 for doubles). With single crochet, round `k` is `(sc × (k-2), inc) × 6`, so round 3 is `(sc, inc) × 6` and round 4 is `(2 sc, inc) × 6`. The taller stitches work "2 in the next stitch" instead.

`circleRows(stitch, rounds, color)` returns those rows. The best test is one that uses your *own* earlier code: it counts each generated row with `rowStats` and checks that round `k` leaves exactly `n0 × k` stitches. You are using a function from part 1 to check a function from part 5: a sign that the pieces fit.

## How it fits together
The provided **Import from photo** dialog does this:
1. `loadPhoto` and `detectPiece`: find the piece.
2. `radialProfiles` → **your `estimateRounds`**: count the rounds.
3. `pieceColor`: read the yarn colour.
4. **your `circleRows`**: build the rows.
5. **your `RoundChart`**: draw the preview.
You can change the number of rounds, the stitch and the colour before creating the chart.

## What the app can do now
With 5.3 and 5.4 green, open **Import from photo** on the *My charts* page, choose a photo of a round piece (or paste one), look at the thin guide rings on the photo, adjust **Rounds** until they match, and create the chart. A photo can't show every stitch, so the result is a starting chart for you to edit. The photo never leaves your browser.

## Exercises 5.3.-5.4.

| | | file you edit |
|---|---|---|
| **5.3** [Count rounds from a photo](../../exercises/part5-fullstack/5.3-estimate-rounds/README.md) | algorithms, signal processing | `src/core/estimateRounds.ts` |
| **5.4** [Build the circle chart](../../exercises/part5-fullstack/5.4-circle-rows/README.md) | generating data from a rule | `src/core/circleRows.ts` |

Next: [5d · Where to go from here](d-where-to-go-from-here.md).
