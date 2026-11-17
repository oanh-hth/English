# Lexigrow

A notebook for the English you pick up, with spaced review, exercises built from your own notes, and a plant that grows as you study. Works on iPhone and iPad, installs to the home screen, runs offline, and keeps everything on your device.

## What it does

- **Notes.** Save phrases and words with a meaning, an example and a note. **Quick add** takes just the phrase, so you can capture it mid-video and finish it later: unfinished notes wait in a "To finish" list and stay out of reviews until they have a meaning or an example. Search, edit, delete, or add many at once (`phrase = meaning | example`, one per line). Every note has audio (the browser's American English voice) and a **YouGlish** link to hear real speakers.
- **Today's session.** One button on the Garden screen chains the day's work: review what is due, write sentences with three of those words, say them out loud, then the real-life mission. The card ticks off each step.
- **Spaced review.** New notes come back tomorrow, then after 3, 7, 14, 30, 60 and 120 days. No more than a set number (default 10, change it in Me) land on one day. After a break you catch up at twice that pace and the rest rolls over. Cards come in three kinds: recall (you grade yourself), fill the gap in your own example, and listen and type. The last two are **checked by the app**. "Again" costs two stages, not all of them. Notes you keep forgetting are flagged as **hard words** with a prompt to rewrite them.
- **Honest points.** Every answer earns the same growth whatever you rate it (3 per review, 5 per sentence, 3 per spoken note), so there is nothing to gain from overrating yourself.
- **Practice that needs no AI.** Write your own sentence with each word and judge it (with a one-tap "copy to ask someone" for a tutor or a friend), record yourself saying it and compare with the model, and a daily "use it today" mission.
- **A plant to grow.** Choose a seed: tomato, chilli, strawberry, sunflower, pumpkin, sugarcane or bamboo. Studying on a day waters it (+20 growth) and everything you do adds growth. Harvest ripe plants into your collection. A plant neglected for 3 days looks thirsty and recovers as soon as you study.
- **Weather in the garden.** Optional. The scene shows the real sky from [Open-Meteo](https://open-meteo.com/) (free, no API key). Only rounded coordinates are sent.
- **Keeping your notes safe.** Everything lives in your browser. The app reminds you to export a backup, and to add it to the Home Screen on iPhone and iPad so Safari does not clear its data. For real syncing between devices there is an optional server in [`server/`](server/README.md).

## Files

| File | Role |
|---|---|
| `srs.js` | Spaced-repetition scheduler (pure, unit tested) |
| `exercises.js` | Text helpers: placeholders, gap blanks, did-you-use-the-word check (pure, unit tested) |
| `plants.js` | Plant catalogue and the SVG drawings for every growth stage |
| `weather.js` | Open-Meteo client and the animated weather scene |
| `core.js` | State in localStorage, growth and points, tabs, sheets, speech |
| `merge.js`, `sync.js` | Merging two copies of your data (unit tested) and the optional sync client |
| `server/` | The optional sync server: Node, Express, PostgreSQL, with tests |
| `notebook.js`, `views.js`, `session.js` | Notes, Garden, Review and Me screens, flashcard review |
| `practice.js` | Write-your-sentences, say-it-out-loud and the daily mission |
| `sw.js`, `manifest.webmanifest` | Offline and install |

## Run and test

```bash
python3 -m http.server 8123        # then open http://localhost:8123
node tests/srs.test.js             # scheduler
node tests/exercises.test.js       # text helpers
node tests/merge.test.js           # merging two devices' data
node tests/e2e.js                  # Playwright, needs the server above; weather is mocked
```

Deploy by serving the repository root (GitHub Pages works). Back up your notes from Me > Export backup.

## Learn to build it

[`course/`](course/README.md) is a Full Stack Open style course that rebuilds this app as a full stack project: React and TypeScript, Node and Express, and PostgreSQL with Sequelize migrations. It has 13 parts with lessons and numbered exercises, a database schema with practice data, starter code with automated tests, and reference solutions. This folder is its behaviour reference.

## Secrets

No API key or `.env` file belongs in this repository. `.gitignore` blocks them. The app needs no API key. It sends nothing anywhere except rounded coordinates to the weather service if you turn weather on, and your data to your own sync server if you sign in to one. The sync server reads its secrets from environment variables (`server/.env` is ignored by git).
