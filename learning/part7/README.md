# Part 7: Your own content

Learners always want to fix a phrase or add their own. You'll let them: add words and phrases to any topic, edit or delete built-in items without touching the data files, and export and import everything. This is where you meet **forms**, **overrides** and **file handling**.

| Lesson | Topic | Exercises |
|---|---|---|
| [a](a-forms.md) | Forms, validation and the bottom sheet | 7.1 – 7.5 |
| [b](b-overrides.md) | Overrides: edit and delete built-in content | 7.6 – 7.11 |
| [c](c-export-import.md) | Export, import and quality flags | 7.12 – 7.16 |

## Checkpoint 7

- [ ] Add a word or a phrase to a chosen topic; it appears in lists, exercises and your deck
- [ ] Edit and delete work for built-in and custom items; built-in changes are overrides
- [ ] "Reset to original", "Restore deleted" and "Undo my edits" work
- [ ] Export downloads a JSON file; importing it on a clean browser restores everything
- [ ] A bad import file is rejected with a clear message and changes nothing
- [ ] "Sounds odd?" flags items and you can copy the flagged list
- [ ] `git tag part7`

## Reference files to compare afterwards
`app.js`: `registerCustom`, `rebuildALL`, `openEdit`, the `saveEdit`/`del`/`restoreDeleted`/`undoEdits` actions; `units-ui.js`: `openAdd`, `saveWord`; `A.flag`, `A.copyFlags`.
