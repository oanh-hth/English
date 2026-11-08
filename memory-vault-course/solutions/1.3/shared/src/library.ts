import type { Library, LibraryEntry, LibraryFilter, MediaItem, YearGroup } from './types';

export function seriesItems(library: Library, seriesId: string): MediaItem[] {
  return library.media.filter((m) => m.seriesId === seriesId).sort((a, b) => a.position - b.position);
}

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const itemText = (m: MediaItem) => `${m.title} ${m.note} ${m.tags} ${m.originalName}`.toLowerCase();

export function buildEntries(library: Library, filter: LibraryFilter): LibraryEntry[] {
  const q = filter.query.trim().toLowerCase();
  const entries: LibraryEntry[] = [];

  for (const item of library.media) {
    if (item.seriesId !== null) continue;
    if (filter.kind && item.kind !== filter.kind) continue;
    if (q && !itemText(item).includes(q)) continue;
    entries.push({ type: 'item', date: item.takenOn || isoDay(item.createdAt), item });
  }

  for (const series of library.series) {
    const photos = seriesItems(library, series.id);
    if (photos.length === 0) continue;
    const kindOk = !filter.kind || photos.some((p) => p.kind === filter.kind);
    const textOk =
      !q ||
      `${series.title} ${series.note} ${series.tags}`.toLowerCase().includes(q) ||
      photos.some((p) => itemText(p).includes(q));
    if (!kindOk || !textOk) continue;
    const cover = photos.find((p) => p.id === series.coverId) ?? photos[0];
    entries.push({ type: 'series', date: series.takenOn || isoDay(series.createdAt), series, cover, count: photos.length });
  }

  return entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function groupByYear<T extends { date: string }>(entries: T[]): YearGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const entry of entries) {
    const year = entry.date.slice(0, 4) || 'Undated';
    const list = groups.get(year) ?? [];
    list.push(entry);
    groups.set(year, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === 'Undated' ? 1 : b === 'Undated' ? -1 : b.localeCompare(a)))
    .map(([year, list]) => ({ year, entries: list }));
}
