# Word Garden

A notebook for the English you pick up, with spaced review, exercises built from your own notes, and a plant that grows as you study. Works on iPhone and iPad, installs to the home screen, runs offline, and keeps everything on your device.

## What it does

- **Notes.** Save phrases and words with a meaning, an example and a note. Search, edit, delete, or add many at once (`phrase = meaning | example`, one per line). Every note has audio (the browser's American English voice) and a **YouGlish** link to hear real speakers.
- **Spaced review.** New notes come back tomorrow, then after 3, 7, 14, 30, 60 and 120 days. No more than a set number of notes (default 10, change it in Me) fall on one day, so a big batch is spread over several days instead of piling up. The Review tab shows what is due today and a day-by-day schedule for the next 3 weeks. Grade each note Again, Hard, Good or Easy.
- **One exercise: write with your words.** The app picks three of your notes (due and weaker ones first). You write a sentence or two using them, and Claude scores how natural it sounds (0 to 100), says whether each word was used correctly, rewrites the text the way a native speaker would, lists the most useful fixes, and suggests phrases you can save to your notebook. Points grow your plant, and the result feeds the review schedule: a word used naturally counts as a Good review, a misused one comes back sooner. It needs your own Claude API key (Me tab). The key stays in this browser only, never in the app data, backups or the repository.
- **A plant to grow.** Choose a seed: tomato, chilli, strawberry, sunflower, pumpkin, sugarcane or bamboo. Studying on a day waters it (+20 growth). Reviews, new notes and especially writing points add growth, so more practice grows it faster. When it is ripe, harvest it into your collection and plant another. A plant that is neglected for 3 days looks thirsty, and recovers as soon as you study.
- **Weather in the garden.** Optional. The scene shows the real sky (clear, cloudy, fog, drizzle, rain, snow, thunderstorm, day or night) from [Open-Meteo](https://open-meteo.com/), which is free and needs no API key. Only rounded coordinates are sent. "Preview" mode lets you see every weather without waiting for it.

## Files

| File | Role |
|---|---|
| `srs.js` | Spaced-repetition scheduler (pure, unit tested) |
| `exercises.js` | Text helpers: phrase matching and gap blanks (pure, unit tested) |
| `plants.js` | Plant catalogue and the SVG drawings for every growth stage |
| `weather.js` | Open-Meteo client and the animated weather scene |
| `core.js` | State in localStorage, growth and points, tabs, sheets, speech |
| `notebook.js`, `views.js`, `session.js` | Notes, Garden, Review and Me screens, flashcard review |
| `writing.js` | The writing exercise and the Claude request |
| `sw.js`, `manifest.webmanifest` | Offline and install |
| `legacy-v1/`, `learning/` | The earlier phrase trainer and the course that teaches how to build it |

## Run and test

```bash
python3 -m http.server 8123        # then open http://localhost:8123
node tests/srs.test.js             # scheduler
node tests/exercises.test.js       # text helpers
node tests/e2e.js                  # Playwright, needs the server above; weather and Claude are mocked
```

Deploy by serving the repository root (GitHub Pages works). Back up your notes from Me > Export backup.

## Secrets

No API key or `.env` file belongs in this repository. `.gitignore` blocks them. Features that need a key keep it in the browser's localStorage on your device only.
