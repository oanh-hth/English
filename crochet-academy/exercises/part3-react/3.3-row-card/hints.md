## Hint 1
Compute the label once: `` const label = `${mode === 'round' ? 'Round' : 'Row'} ${index + 1}`; `` and reuse it for the heading and the `aria-label`s.

## Hint 2
Conditional rendering: `{row.items.length ? <ul>...</ul> : <p>Empty. Pick a stitch and add it.</p>}`.

## Hint 3
`onClick={(event) => { event.stopPropagation(); onRemove(row.id); }}` on the delete button. The `<li>` needs a `key`; the index is fine here because the list order only changes by edits.
