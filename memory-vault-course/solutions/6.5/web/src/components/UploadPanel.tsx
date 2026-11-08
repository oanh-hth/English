import { useState, type FormEvent } from 'react';

export interface UploadPlan {
  files: File[];
  mode: 'series' | 'separate';
  title: string;
  date: string;
}

export interface UploadPanelProps {
  files: File[];
  onSubmit: (plan: UploadPlan) => void;
  onCancel: () => void;
}

const dayOf = (file: File) => new Date(file.lastModified).toISOString().slice(0, 10);

export function UploadPanel({ files, onSubmit, onCancel }: UploadPanelProps) {
  const [order, setOrder] = useState<File[]>(files);
  const [choice, setChoice] = useState<'series' | 'separate'>('series');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => files.map(dayOf).sort()[0] ?? '');

  const many = order.length > 1;
  const mode = many ? choice : 'separate';

  function move(index: number, direction: -1 | 1) {
    const next = [...order];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setOrder(next);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ files: order, mode, title: title.trim(), date });
  }

  return (
    <form className="stage-up" onSubmit={handleSubmit}>
      <h2>{order.length === 1 ? '1 file selected' : `${order.length} files selected`}</h2>

      {many && (
        <fieldset className="modes">
          <label>
            <input type="radio" name="mode" checked={choice === 'series'} onChange={() => setChoice('series')} /> One series, in this order
          </label>
          <label>
            <input type="radio" name="mode" checked={choice === 'separate'} onChange={() => setChoice('separate')} /> Separate items
          </label>
        </fieldset>
      )}

      {mode === 'series' && (
        <div className="sfields">
          <label>
            Series title
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hanoi trip" />
          </label>
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
      )}

      <ol aria-label="Files">
        {order.map((file, index) => (
          <li key={`${file.name}-${index}`}>
            {file.name}
            {mode === 'series' && (
              <>
                <button type="button" aria-label={`Move ${file.name} earlier`} disabled={index === 0} onClick={() => move(index, -1)}>
                  ‹
                </button>
                <button type="button" aria-label={`Move ${file.name} later`} disabled={index === order.length - 1} onClick={() => move(index, 1)}>
                  ›
                </button>
              </>
            )}
          </li>
        ))}
      </ol>

      <div className="row">
        <button className="btn primary" type="submit">
          {mode === 'series' ? 'Create series' : 'Add to library'}
        </button>
        <button className="btn" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
