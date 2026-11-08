// EXERCISE 6.5: the upload panel. Make `npm run ex -- 6.5` pass.
//
// After you pick files, this panel asks what to do with them: save each as its own memory, or keep them together as
// ONE series in an order you choose. It does not upload anything itself: it hands a "plan" to its parent.
// New ideas: state that holds an ARRAY you reorder without changing the original, and conditional rendering:
//     const next = [...order]; [next[i], next[j]] = [next[j], next[i]]; setOrder(next);
//     {showTitle && <input ... />}
import { useState } from 'react';

export interface UploadPlan {
  /** The files in the order the user chose. */
  files: File[];
  mode: 'series' | 'separate';
  /** Series title (only meaningful for 'series'). */
  title: string;
  /** Series date, YYYY-MM-DD (only meaningful for 'series'). */
  date: string;
}

export interface UploadPanelProps {
  files: File[];
  onSubmit: (plan: UploadPlan) => void;
  onCancel: () => void;
}

/**
 * Render:
 *  - a heading: "1 file selected" or "3 files selected"
 *  - an ordered list <ol aria-label="Files"> with one <li> per file showing its name.
 *  - when there is more than one file, a <fieldset> with two radio buttons:
 *       <label><input type="radio" name="mode" /> One series, in this order</label>   (selected at the start)
 *       <label><input type="radio" name="mode" /> Separate items</label>
 *    (With a single file there is no choice: it is always 'separate'.)
 *  - in series mode: <label>Series title<input /></label> and <label>Date<input type="date" /></label>.
 *    The date starts as the EARLIEST file date (new Date(file.lastModified).toISOString().slice(0, 10)).
 *    Also in series mode, every file row has two buttons with aria-label `Move ${file.name} earlier` and
 *    `Move ${file.name} later` (text "‹" and "›"). The first file's "earlier" and the last file's "later" are disabled.
 *    Clicking one swaps that file with its neighbour (the list on screen changes).
 *  - a submit button: "Create series" in series mode, "Add to library" otherwise; and a "Cancel" button.
 * Submit calls onSubmit({ files: <current order>, mode, title: title.trim(), date }). Cancel calls onCancel.
 * `mode` in the plan is 'separate' for a single file.
 */
export function UploadPanel({ files, onSubmit, onCancel }: UploadPanelProps) {
  return <p>TODO: UploadPanel</p>;
}
