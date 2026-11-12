import { useState, type FormEvent } from 'react';
import { parseTags } from '@memory-vault/shared';

export interface NoteValues {
  title: string;
  takenOn: string;
  tags: string;
  note: string;
}

export interface NoteEditorProps {
  initial: NoteValues;
  onSave: (values: NoteValues) => Promise<void>;
}

export function NoteEditor({ initial, onSave }: NoteEditorProps) {
  const [values, setValues] = useState<NoteValues>(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  const change = (field: keyof NoteValues) => (value: string) => {
    setValues({ ...values, [field]: value });
    if (status === 'saved') setStatus('idle');
  };
  const tags = parseTags(values.tags);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('saving');
    try {
      await onSave({ ...values, title: values.title.trim(), tags: values.tags.trim() });
      setStatus('saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
      setStatus('error');
    }
  }

  return (
    <form className="side" onSubmit={handleSubmit}>
      <label>
        Title
        <input className="title" value={values.title} maxLength={200} onChange={(e) => change('title')(e.target.value)} />
      </label>
      <label>
        Date of the memory
        <input type="date" value={values.takenOn} onChange={(e) => change('takenOn')(e.target.value)} />
      </label>
      <label>
        Tags
        <input value={values.tags} maxLength={300} onChange={(e) => change('tags')(e.target.value)} />
      </label>
      {tags.length > 0 && (
        <ul aria-label="Tag list" className="chips">
          {tags.map((tag) => (
            <li key={tag.toLowerCase()} className="chip">
              {tag}
            </li>
          ))}
        </ul>
      )}
      <label>
        Notes
        <textarea className="note" value={values.note} maxLength={50000} onChange={(e) => change('note')(e.target.value)} />
      </label>
      {status === 'saved' && (
        <p role="status" className="status">
          Saved ♥
        </p>
      )}
      {status === 'error' && (
        <p role="alert" className="status">
          {error}
        </p>
      )}
      <button className="btn primary" type="submit" disabled={status === 'saving'}>
        {status === 'saving' ? 'Saving…' : 'Save notes'}
      </button>
    </form>
  );
}
