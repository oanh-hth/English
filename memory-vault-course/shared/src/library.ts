// EXERCISE 1.3: what the library page shows. Make `npm run ex -- 1.3` pass.
//
// The server sends two flat lists: all the media and all the series. The page wants a tidy list of "entries"
// (a loose photo, or a whole series as one stack) grouped by year. Doing this as pure functions means you can test it
// without any browser. The React component in exercise 6.4 will call these functions.
import type { Library, LibraryEntry, LibraryFilter, MediaItem, YearGroup } from './types';

/**
 * The photos of one series, in display order (smallest `position` first). Returns [] for an unknown series.
 * Do not change the original array: use a copy before sorting.
 */
export function seriesItems(library: Library, seriesId: string): MediaItem[] {
  throw new Error('Not implemented: seriesItems');
}

/**
 * Build the entries for the library page.
 *
 * Loose items (seriesId === null) become { type: 'item' } entries. Items that belong to a series never appear alone.
 * Each series that has at least one photo becomes ONE { type: 'series' } entry with:
 *   cover = the photo whose id is series.coverId, or the first photo when there is none
 *   count = number of photos in the series
 *
 * `date` of an entry is takenOn, or when that is '' the calendar day of createdAt (new Date(ms).toISOString().slice(0, 10)).
 * Sort the result newest date first.
 *
 * Filtering (filter.query is trimmed and compared without upper/lower case):
 *   - an item matches when its title, note, tags or originalName contains the query
 *   - a series matches when its title, note or tags contains the query OR any of its photos matches
 *   - an empty query matches everything
 *   - filter.kind '' means any kind; otherwise an item must have that kind, and a series needs at least one photo of that kind
 */
export function buildEntries(library: Library, filter: LibraryFilter): LibraryEntry[] {
  throw new Error('Not implemented: buildEntries');
}

/**
 * Group entries (already sorted) by the year in their date, e.g. "2024-07-04" -> "2024".
 * Years go newest first. Entries with an empty date go in a group called "Undated", which is always last.
 * Keep the order of entries inside each group. Works for anything that has a `date` string.
 */
export function groupByYear<T extends { date: string }>(entries: T[]): YearGroup<T>[] {
  throw new Error('Not implemented: groupByYear');
}
