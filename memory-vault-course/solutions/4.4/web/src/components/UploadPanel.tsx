import type { FormEvent } from 'react';

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

export function UploadPanel({ files, onSubmit, onCancel }: UploadPanelProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ files, mode: 'separate', title: '', date: '' });
  }

  return (
    <form className="stage-up" onSubmit={handleSubmit}>
      <h2>{files.length === 1 ? '1 file selected' : `${files.length} files selected`}</h2>
      <ol aria-label="Files">
        {files.map((file, index) => (
          <li key={`${file.name}-${index}`}>{file.name}</li>
        ))}
      </ol>
      <div className="row">
        <button className="btn primary" type="submit">
          Add to library
        </button>
        <button className="btn" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
