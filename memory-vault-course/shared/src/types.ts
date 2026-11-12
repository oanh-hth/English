// The shapes of data shared by the server and the web app. This file is given: read it, you will use it everywhere.

export type MediaKind = 'image' | 'video';

/** What we learn about a file by looking at its first bytes. */
export interface FileType {
  kind: MediaKind;
  mime: string;
  ext: string;
}

/** One photo or video, as the API sends it to the browser. */
export interface MediaItem {
  id: string;
  kind: MediaKind;
  mime: string;
  originalName: string;
  size: number;
  title: string;
  note: string;
  /** Comma separated, for example "family, beach". */
  tags: string;
  /** The date of the memory, YYYY-MM-DD, or '' when unknown. */
  takenOn: string;
  /** The series this item belongs to, or null for a loose item. */
  seriesId: string | null;
  /** Order inside its series (0, 1, 2, ...). */
  position: number;
  /** Milliseconds since 1970. */
  createdAt: number;
}

/** An ordered group of photos with one shared note. */
export interface Series {
  id: string;
  title: string;
  note: string;
  tags: string;
  takenOn: string;
  coverId: string | null;
  createdAt: number;
}

/** Everything the library page needs. */
export interface Library {
  media: MediaItem[];
  series: Series[];
}

/** One tile in the library: a loose item, or a whole series shown as a stack. */
export type LibraryEntry =
  | { type: 'item'; date: string; item: MediaItem }
  | { type: 'series'; date: string; series: Series; cover: MediaItem; count: number };

export interface YearGroup<T> {
  year: string;
  entries: T[];
}

export interface LibraryFilter {
  /** Free text, matched against titles, notes, tags and file names. */
  query: string;
  /** '' means both photos and videos. */
  kind: '' | MediaKind;
}
