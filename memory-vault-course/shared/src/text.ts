// EXERCISE 1.1: text utilities. Make `npm run ex -- 1.1` pass.
// Small pure functions: the same input always gives the same output, nothing is read from disk or the network.

/**
 * Turn a byte count into friendly text.
 *   0            -> "0 KB"      (also for negative numbers, NaN and Infinity)
 *   1 .. 1499    -> "1 KB"      (anything above 0 shows at least 1 KB)
 *   2_500        -> "3 KB"      (rounded to a whole number)
 *   6_800_000    -> "6.8 MB"    (one decimal, from 1 000 000 bytes up)
 *   1_840_000_000-> "1.84 GB"   (two decimals, from 1 000 000 000 bytes up)
 * Use 1000 (not 1024) per step.
 */
export function formatSize(bytes: number): string {
  throw new Error('Not implemented: formatSize');
}

/**
 * True only for a real calendar date written as YYYY-MM-DD.
 *   "2024-07-04" -> true      "2024-02-29" -> true (leap year)      "2023-02-29" -> false
 *   "2024-13-01" -> false     "2024-7-4"   -> false                 "" -> false      42 -> false
 * The `value is string` return type is a type guard: after `if (isIsoDate(x))` TypeScript knows x is a string.
 */
export function isIsoDate(value: unknown): value is string {
  throw new Error('Not implemented: isIsoDate');
}

/**
 * "2024-07-04" -> "Jul 4, 2024". Anything that is not a valid date (including "") -> "No date".
 * Do not use Intl or toLocaleDateString: they depend on the machine's time zone and language.
 */
export function formatDate(iso: string): string {
  throw new Error('Not implemented: formatDate');
}

/**
 * Make an uploaded file name safe to store and show.
 *   "C:\\photos\\beach.jpg" -> "beach.jpg"     "../../etc/passwd" -> "passwd"
 *   "  a\u0000b.png "       -> "ab.png"        (control characters removed, spaces trimmed)
 *   "" or "   "             -> "untitled"      (never return an empty name)
 * Keep at most 200 characters.
 */
export function cleanFileName(name: string): string {
  throw new Error('Not implemented: cleanFileName');
}

/**
 * Split "family, Beach ,, beach" into ["family", "Beach"].
 * Trim each tag, drop empty ones, and drop repeats ignoring upper/lower case (keep the first spelling).
 */
export function parseTags(raw: string): string[] {
  throw new Error('Not implemented: parseTags');
}
