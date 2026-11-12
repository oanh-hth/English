// EXERCISE 3.3: the note editor. Make `npm run ex -- 3.3` pass.
//
// This is where you write down a memory: title, date, tags and a note. New ideas:
//  - several pieces of state in one object:  const [values, setValues] = useState(initial);
//    update one field without losing the others:  setValues({ ...values, title: e.target.value })
//  - DERIVED data: the tag chips are not state, they are computed from `values.tags` on every render with parseTags (1.1).
//  - React escapes text for you: {tag} in JSX can never run script. Never use dangerouslySetInnerHTML for user text.
import { useState, type FormEvent } from 'react';
import { parseTags } from '@memory-vault/shared';

export interface NoteValues {
  title: string;
  /** YYYY-MM-DD or '' */
  takenOn: string;
  /** Comma separated, as typed. */
  tags: string;
  note: string;
}

export interface NoteEditorProps {
  initial: NoteValues;
  /** Saves the values. Rejects when saving fails. */
  onSave: (values: NoteValues) => Promise<void>;
}

/**
 * Render a form with:
 *   - <label>Title<input /></label>                       (text)
 *   - <label>Date of the memory<input type="date" /></label>
 *   - <label>Tags<input /></label>
 *   - a list <ul aria-label="Tag list"> with one <li className="chip"> per tag from parseTags(values.tags). It updates live as
 *     the user types. Render nothing for the list (or an empty one) when there are no tags.
 *   - <label>Notes<textarea /></label>
 *   - a submit button "Save notes" (disabled and saying "Saving…" while saving)
 * Start with the `initial` values.
 *
 * On submit: preventDefault, then await onSave({ title: title.trim(), takenOn, tags: tags.trim(), note }).
 * (The note is saved exactly as typed.)
 *   - success: show <p role="status">Saved ♥</p>
 *   - failure: show <p role="alert"> with the error message (or "Could not save")
 * Changing any field hides the "Saved ♥" message (the text on screen no longer matches what was saved).
 */
export function NoteEditor({ initial, onSave }: NoteEditorProps) {
  return <p>TODO: NoteEditor</p>;
}
