import { useEffect, useState } from 'react';
import type { MediaItem, Series } from '@memory-vault/shared';

export interface SeriesReaderProps {
  series: Series;
  photos: MediaItem[];
  startIndex?: number;
  onMove: (id: string, direction: -1 | 1) => void;
  onSetCover: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export function SeriesReader({ series, photos, startIndex = 0, onMove, onSetCover, onRemove, onClose }: SeriesReaderProps) {
  const [rawIndex, setIndex] = useState(startIndex);
  const last = photos.length - 1;
  const index = Math.max(0, Math.min(rawIndex, last));
  const photo = photos[index];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, last));
      else if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [last, onClose]);

  if (!photo) {
    return (
      <div className="left">
        <h2>{series.title}</h2>
        <p>No photos in this series.</p>
        <button className="btn" type="button" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  const src = `/api/media/${photo.id}/file`;
  const isCover = photo.id === series.coverId;

  return (
    <div className="left">
      <h2>{series.title}</h2>
      {series.note && <p>{series.note}</p>}

      <div className="stage">
        {photo.kind === 'video' ? <video src={src} controls /> : <img src={src} alt={photo.title || photo.originalName} />}
      </div>
      <h3>
        Photo {index + 1} of {photos.length}
      </h3>
      <p aria-live="polite">
        {index + 1} / {photos.length}
      </p>

      <div className="row">
        <button className="btn" type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          Previous
        </button>
        <button className="btn" type="button" disabled={index === last} onClick={() => setIndex(index + 1)}>
          Next
        </button>
      </div>
      <div className="row">
        <button
          className="btn sm"
          type="button"
          disabled={index === 0}
          onClick={() => {
            onMove(photo.id, -1);
            setIndex(index - 1);
          }}
        >
          Move earlier
        </button>
        <button
          className="btn sm"
          type="button"
          disabled={index === last}
          onClick={() => {
            onMove(photo.id, 1);
            setIndex(index + 1);
          }}
        >
          Move later
        </button>
        <button className="btn sm" type="button" disabled={isCover} onClick={() => onSetCover(photo.id)}>
          {isCover ? 'Is the cover' : 'Set as cover'}
        </button>
        <button className="btn sm danger" type="button" onClick={() => onRemove(photo.id)}>
          Remove from series
        </button>
        <button className="btn" type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
