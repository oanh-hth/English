// EXERCISES 4.4 and 5.3: the upload panel. This one file grows over two parts.
//
// After you pick files, this panel asks what to do with them. It does not upload anything itself: it hands a "plan" to
// its parent (App.tsx does the uploading with the code from this part's server routes).
// New ideas: lists in JSX ({files.map(...)} with a `key`), and callbacks as props.
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
 * ===== Exercise 4.4 (part 4): the basic panel. `npm run ex -- 4.4` =====
 * Render a <form className="stage-up"> with:
 *  - a heading: "1 file selected" or "3 files selected"
 *  - an ordered list <ol aria-label="Files"> with one <li> per file showing its name
 *  - a submit button "Add to library" and a button "Cancel" (type="button")
 * Submit: event.preventDefault(), then onSubmit({ files, mode: 'separate', title: '', date: '' }). Cancel calls onCancel.
 *
 * ===== Exercise 5.3 (part 5): series mode. `npm run ex -- 5.3` =====
 * Extend the same component. Keep the files in state so they can be reordered:  const [order, setOrder] = useState(files);
 *  - With MORE than one file show a <fieldset> with two radio buttons, "One series, in this order" (selected at the start)
 *    and "Separate items". (With a single file there is no choice: always 'separate'.)
 *  - In series mode show <label>Series title<input /></label> and <label>Date<input type="date" /></label>.
 *    The date starts as the EARLIEST file date (new Date(file.lastModified).toISOString().slice(0, 10)).
 *  - Also in series mode every file row gets two buttons with aria-label `Move ${file.name} earlier` and
 *    `Move ${file.name} later` (text "‹" and "›"). The first file's "earlier" and the last file's "later" are disabled.
 *    Clicking one swaps the file with its neighbour (copy the array: [...order], never change state in place).
 *  - The submit button says "Create series" in series mode and "Add to library" otherwise.
 *  - Submit calls onSubmit({ files: <current order>, mode, title: title.trim(), date }). `mode` is 'separate' for one file.
 */
export function UploadPanel({ files, onSubmit, onCancel }: UploadPanelProps) {
  return <p>TODO: UploadPanel</p>;
}
