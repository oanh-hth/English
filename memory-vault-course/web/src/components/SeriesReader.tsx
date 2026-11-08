// EXERCISE 6.6: the series reader. Make `npm run ex -- 6.6` pass.
//
// Flip through the photos of a series like a little album, and reorder them. New ideas:
//  - useEffect to react to the outside world, here the keyboard. Always clean up what you start:
//        useEffect(() => { const h = (e: KeyboardEvent) => ...; document.addEventListener('keydown', h);
//                          return () => document.removeEventListener('keydown', h); }, [deps]);
//  - clamping an index so it never leaves the list:  Math.max(0, Math.min(index, list.length - 1))
// Docs: https://react.dev/learn/synchronizing-with-effects
import { useEffect, useState } from 'react';
import type { MediaItem, Series } from '@memory-vault/shared';

export interface SeriesReaderProps {
  series: Series;
  /** The photos of the series in display order. */
  photos: MediaItem[];
  /** Which photo to show first (0-based). Default 0. */
  startIndex?: number;
  /** Move this photo one place earlier (-1) or later (1). The parent saves it and sends new `photos`. */
  onMove: (id: string, direction: -1 | 1) => void;
  onSetCover: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

/**
 * Render (with the current photo = photos[index]; keep `index` in state, starting at startIndex):
 *  - <h2>{series.title}</h2> and, when the series has a note, it in a <p>.
 *  - the photo: <img src={`/api/media/${id}/file`} alt={title || originalName} />; for a video use <video ... controls />.
 *  - <h3>Photo {index + 1} of {photos.length}</h3> and a counter <p>{index + 1} / {photos.length}</p>
 *  - buttons "Previous" and "Next" (disabled on the first / last photo).
 *    The ArrowLeft / ArrowRight keys do the same (add a document keydown listener in useEffect and remove it on cleanup).
 *    The Escape key calls onClose.
 *  - "Move earlier" (disabled on the first photo) and "Move later" (disabled on the last). They call
 *    onMove(photo.id, -1 or 1) and then follow the photo: index changes by -1 or +1.
 *  - "Set as cover": calls onSetCover(photo.id). When the photo is already the cover (photo.id === series.coverId),
 *    the button is disabled and says "Is the cover".
 *  - "Remove from series": calls onRemove(photo.id).
 *  - "Close": calls onClose.
 * Put everything inside ONE outer <div className="left">: the dialog is a two-column card and `left` is its left column
 * (the note editor sits in the right column). Wrap the photo in <div className="stage"> for the framed look.
 * The parent may send a shorter `photos` list after a removal, so never read photos[index] without clamping the index.
 * With no photos at all, render <p>No photos in this series.</p> and just the Close button.
 */
export function SeriesReader(props: SeriesReaderProps) {
  return <p>TODO: SeriesReader</p>;
}
