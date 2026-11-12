import { useMemo, useState } from 'react';
import {
  buildEntries,
  formatDate,
  groupByYear,
  type Library as LibraryData,
  type LibraryEntry,
  type MediaItem,
  type MediaKind,
} from '@memory-vault/shared';

export interface LibraryProps {
  library: LibraryData;
  onOpenItem: (id: string) => void;
  onOpenSeries: (id: string) => void;
}

function Thumb({ item }: { item: MediaItem }) {
  const src = `/api/media/${item.id}/file`;
  return (
    <div className="thumb">
      {item.kind === 'video' ? (
        <video src={src} muted preload="metadata" />
      ) : item.mime === 'image/heic' ? (
        <div className="ic">HEIC</div>
      ) : (
        <img src={src} alt="" loading="lazy" />
      )}
    </div>
  );
}

function Tile({ entry, onOpenItem, onOpenSeries }: { entry: LibraryEntry } & Pick<LibraryProps, 'onOpenItem' | 'onOpenSeries'>) {
  if (entry.type === 'series') {
    return (
      <button type="button" className="tile series" onClick={() => onOpenSeries(entry.series.id)}>
        <Thumb item={entry.cover} />
        <span className="pill l">{entry.count} items</span>
        <span className="cap">
          <b>{entry.series.title}</b>
          <small>Series · {formatDate(entry.date)}</small>
        </span>
      </button>
    );
  }
  const { item } = entry;
  return (
    <button type="button" className="tile" onClick={() => onOpenItem(item.id)}>
      <Thumb item={item} />
      {item.note && (
        <span className="pill l heart" title="Has a note">
          ♥
        </span>
      )}
      <span className="cap">
        <b>{item.title || item.originalName}</b>
        <small>{formatDate(entry.date)}</small>
      </span>
    </button>
  );
}

export function Library({ library, onOpenItem, onOpenSeries }: LibraryProps) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'' | MediaKind>('');
  const groups = useMemo(() => groupByYear(buildEntries(library, { query, kind })), [library, query, kind]);

  return (
    <div>
      <div className="bar">
        <input
          className="search"
          type="search"
          aria-label="Search"
          placeholder="Search titles, notes, tags"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select aria-label="Filter by type" value={kind} onChange={(e) => setKind(e.target.value as '' | MediaKind)}>
          <option value="">All</option>
          <option value="image">Photos</option>
          <option value="video">Videos</option>
        </select>
      </div>

      {groups.length === 0 && <p className="empty">{library.media.length === 0 ? 'Nothing here yet' : 'No matches'}</p>}

      {groups.map((group) => (
        <section key={group.year} aria-label={group.year}>
          <div className="year">
            <h2>{group.year}</h2>
            <span>{group.entries.length === 1 ? '1 entry' : `${group.entries.length} entries`}</span>
          </div>
          <div className="grid">
            {group.entries.map((entry) => (
              <Tile
                key={entry.type === 'series' ? `s-${entry.series.id}` : `i-${entry.item.id}`}
                entry={entry}
                onOpenItem={onOpenItem}
                onOpenSeries={onOpenSeries}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
