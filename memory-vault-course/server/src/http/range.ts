// EXERCISE 2.3: byte ranges. Make `npm run ex -- 2.3` pass.
//
// A video player does not download a whole 2 GB file to jump to minute 40. It asks for a slice:
//     Range: bytes=1000000-1999999
// and the server answers "206 Partial Content" with just those bytes. Without this, videos cannot seek.

export type RangeResult =
  | { status: 200; start: number; end: number } // no Range header: send everything
  | { status: 206; start: number; end: number } // send bytes start..end INCLUDING both ends
  | { status: 416 }; // "range not satisfiable": the request is wrong

/**
 * Turn a Range header into the bytes to send, for a file of `size` bytes.
 *
 *   undefined                    -> { status: 200, start: 0, end: size - 1 }
 *   "bytes=100-199"              -> { status: 206, start: 100, end: 199 }
 *   "bytes=100-"                 -> { status: 206, start: 100, end: size - 1 }          (from 100 to the end)
 *   "bytes=-500"                 -> { status: 206, start: size - 500, end: size - 1 }    (the LAST 500 bytes)
 *   "bytes=0-99999999" (too far) -> end is limited to size - 1
 *   a suffix longer than the file -> start is 0
 *   everything else -> { status: 416 }: wrong format ("items=1-2", "bytes=a-b", "bytes=1-2,5-6"), "bytes=-",
 *   "bytes=-0", a start at or beyond the end of the file, or an end smaller than the start.
 *
 * Tip: /^bytes=(\d*)-(\d*)$/ captures the two numbers (either can be empty).
 */
export function parseRange(header: string | undefined, size: number): RangeResult {
  throw new Error('Not implemented: parseRange');
}
