## Hint 1
`movingAverage`: for index `i`, the window is `from = Math.max(0, i - radius)` to `to = Math.min(length - 1, i + radius)`. Add the values in the window and divide by how many there are (`to - from + 1`), not by `2 * radius + 1`.

## Hint 2
In `estimateRounds`: `const segment = profile.slice(lo, hi)`, `const smooth = movingAverage(segment, ...)`, `const detail = segment.map((v, i) => v - smooth[i])`.

## Hint 3
The search loop: `for (let waves = min; waves <= max; waves += 0.25) { ...compute re, im over k... power = re*re + im*im; keep the best }`. Remember `t` uses the position in the WHOLE profile: `(lo + k + 0.5) / n`. Return `Math.round(best)`.
