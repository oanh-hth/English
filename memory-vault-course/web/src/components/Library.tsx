// EXERCISE 6.4: the library view. Make `npm run ex -- 6.4` pass.
//
// The scrapbook page: search box, filter, then tiles grouped by year. The hard thinking is already done in 1.3
// (buildEntries, groupByYear): this component only turns that data into HTML. New ideas:
//  - rendering a list:  {items.map((item) => <li key={item.id}>...</li>)}   (every item needs a stable `key`)
//  - useMemo to avoid recomputing when nothing changed: const entries = useMemo(() => ..., [library, query, kind])
//  - props that are functions (callbacks) so the parent decides what a click does
import { useMemo, useState } from 'react';
import { buildEntries, formatDate, groupByYear, type Library as LibraryData, type MediaKind } from '@memory-vault/shared';

export interface LibraryProps {
  library: LibraryData;
  onOpenItem: (id: string) => void;
  onOpenSeries: (id: string) => void;
}

/**
 * Render:
 *  1. A search input: type="search", aria-label="Search", placeholder "Search titles, notes, tags".
 *  2. A <select aria-label="Filter by type"> with options "All" (value ""), "Photos" (value "image"), "Videos" (value "video").
 *     Keep the query and kind in state and call buildEntries(library, { query, kind }) then groupByYear(entries).
 *  3. For every year group: a <section aria-label={year}> with an <h2>{year}</h2> and the tiles of that year.
 *     Years come newest first (groupByYear does that).
 *  4. A tile is a <button type="button"> (so it works with the keyboard), with:
 *       - an image: <img src={`/api/media/${id}/file`} alt="" loading="lazy" />  (alt="" because the caption names the tile).
 *         For a video use <video src=... muted preload="metadata" />. For a HEIC photo (mime image/heic) browsers cannot show
 *         it: use <div className="ic">HEIC</div>. A series uses its COVER photo.
 *       - a caption: the title (or originalName when the title is empty) in <b>, and the date from formatDate in <small>.
 *         A series shows its title, the text `${count} items` and "Series" before its date, like  "Series · Nov 2, 2023".
 *       - items that have a note show a small "♥" with title="Has a note".
 *     Clicking an item calls onOpenItem(item.id); clicking a series calls onOpenSeries(series.id).
 *  5. When there is nothing to show: "Nothing here yet" if the library has no media at all, otherwise "No matches".
 * Everything the user wrote (titles, notes...) goes in as plain JSX text. Never use dangerouslySetInnerHTML.
 */
export function Library({ library, onOpenItem, onOpenSeries }: LibraryProps) {
  return <p>TODO: Library</p>;
}
