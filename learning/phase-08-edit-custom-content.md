# Phase 8: Edit & custom content

**Time:** 5–8 hours · **You build:** add, edit and delete items without touching the built-in data file.

## 1. Learn
- **Immutable data plus overrides**: keep the built-in list read-only and store your changes separately.
- **Forms in React**: controlled inputs, validation messages, disabling Save until valid.
- **Modals and bottom sheets**: focus handling, closing on backdrop click and Escape.
- **ID generation** for user items (a prefix such as `c:` so they never clash).
- **Undo and restore** patterns.

## 2. Study the finished app
- `app.js`: `registerCustom`, `rebuildALL`, `openEdit`, the `saveEdit`/`del`/`restoreDeleted`/`undoEdits` actions; and the `edits` and `deleted` maps in saved state.
- `units-ui.js`: `openAdd` (word or phrase, topic dropdown) and `saveWord`.

## 3. Exercise
- [ ] "Add" form: word or phrase, meaning, example, topic; validates before saving
- [ ] Items you add show up in the topic list and in exercises
- [ ] "Edit" works for built-in items by storing an override, not by changing the data file
- [ ] "Delete" hides a built-in item; "Restore deleted" brings it back
- [ ] "Reset to original" undoes one edit
- [ ] Duplicate additions are detected
- [ ] Everything survives a reload (Phase 5)

## 4. Check yourself
1. Why keep built-in data separate from user changes?
2. What happens to a deleted item's review history?
3. How would you let users export their custom items to a file?
4. What would break if two items could share an ID?
