import { todo } from '@/shared/todo';

/**
 * Exercise 5.3: count the rounds of a crocheted circle from a photo.
 *
 * The "Import pattern" dialog measures the average brightness of the photo at many distances from the
 * centre of the piece. Every round is a ring of stitches, so brightness goes up and down once per round:
 * a wave. Counting rounds means finding how many waves fit between the centre and the edge.
 * This is signal processing in about 30 lines.
 */

/**
 * Average of each value with its neighbours up to `radius` positions away on each side.
 * Near the ends the window is cut short (average only the values that exist).
 *   movingAverage([1, 2, 3, 4, 5], 1)  ->  [1.5, 2, 3, 4, 4.5]
 *   radius 0 returns a copy of the input.
 */
export function movingAverage(values: number[], radius: number): number[] {
  // TODO(5.3)
  return todo('5.3');
}

/**
 * `profile[i]` is the brightness at distance (i + 0.5) / profile.length from the centre (0 = centre, 1 = edge).
 *
 *  1. Throw a RangeError when the profile has fewer than 20 samples.
 *  2. Keep only the part between 10% and 94% of the way out: lo = floor(n * 0.1), hi = floor(n * 0.94).
 *     (The very centre is a knot and the very edge is the background.)
 *  3. Remove the slow drift (lighting): subtract movingAverage(segment, max(3, round(segment.length * 0.075))).
 *  4. Try every wave count N from `min` to `max` (defaults 5 and 18) in steps of 0.25. For each N compute
 *     the strength of a wave with N cycles between centre and edge:
 *         re  = sum of  value * window * cos(2 * PI * N * t)
 *         im  = sum of  value * window * sin(2 * PI * N * t)
 *         power = re * re + im * im
 *     where t = (lo + k + 0.5) / n for the k-th value of the segment and
 *     window = 0.5 - 0.5 * cos(2 * PI * (k + 0.5) / segment.length)   (a Hann window: it fades the ends in and out).
 *  5. Return the N with the greatest power, rounded to a whole number.
 */
export function estimateRounds(profile: number[], options: { min?: number; max?: number } = {}): number {
  // TODO(5.3)
  return todo('5.3');
}
