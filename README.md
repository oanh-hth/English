# Listen & Learn

Practice English listening with any YouTube video. Add a link and its transcript, and the app turns it into exercises, recommends the phrases and words worth learning, and gives you a notebook to save them. A **Hear it on YouGlish** link sits next to every phrase and word.

A mobile-first web app with no build step and no backend. It installs on your iPhone (Share, then Add to Home Screen) and keeps everything on your device.

## How it works

1. **Add a video.** Paste the YouTube link and the transcript (copy it from YouTube: **…more → Show transcript**, or upload an `.srt` / `.vtt` file). Timestamps are kept, so the video plays exactly the line you are practicing. Without a link, or without timestamps, lines are read aloud by your phone.
2. **Practice.** Exercises are generated from the real lines:
   - **Dictation:** type what you hear, with a word-by-word diff.
   - **Fill the gaps:** catch the missing words.
   - **Pick the word:** multiple choice for a hidden word.
   - **Word order:** rebuild the sentence from tiles.
   - **Shadowing:** listen, say it out loud, rate yourself.
   - **Comprehension** (optional, with Claude): questions about the video.
3. **Recommended for you.** Natural phrases found in the video (matched against a library of about 1,000 American phrases and 950 everyday words), chunks the speaker repeats, and frequent words you may not know yet. One tap saves them.
4. **Notebook.** Tap a word in any line, tap another to select a phrase, and save it with a meaning and a note. Every item links to YouGlish.

## Run it

```bash
python3 -m http.server 8000   # open http://localhost:8000
```

Host the folder on any static host. For GitHub Pages: **Settings → Pages → Deploy from a branch**, pick the branch and `/ (root)`.

## Tests

```bash
node tests/run.js                              # parser, segmentation, analysis and exercise tests (no dependencies)
python3 -m http.server 8123 &                  # then, with Playwright installed:
node tests/e2e.js                              # iPhone-sized end-to-end test with YouTube and Claude mocked
```

## Optional: Claude picks

In **Me**, paste your own Claude API key to get hand-picked phrases and words and comprehension questions for a video. The key is stored only in your browser and sent only to Anthropic (the official SDK is bundled in `vendor/`). Set a spend limit on the key. **Never commit a key or `.env` file** (see `.gitignore`).

## Limits to know

- **Transcripts are pasted, not fetched.** YouTube does not let web pages download transcripts, so you copy them. A small server could automate this later.
- **Some videos cannot be embedded.** If the owner disallows it, the app falls back to your phone's voice for the lines.
- **The phrase library is AI-written** and has not been reviewed by a native speaker. Use YouGlish to check anything that sounds odd.
- Data lives in `localStorage` on one device. A long transcript or many videos can fill it; delete old videos if the app says storage is full.
- The video player loads YouTube's embedded player, which sets YouTube cookies.

## Layout

| File | Role |
|---|---|
| `core.js` | State, navigation, doodles, toast, confetti |
| `transcript.js` | Link, transcript and caption parsing; segmentation |
| `analyze.js`, `lexicon.js` | Finds phrases and words worth learning |
| `exercises.js` | Exercise generators and answer checking |
| `player.js` | YouTube player with "play this line", plus voice fallback |
| `views.js`, `session.js`, `notes.js` | Screens: home, video, practice, notebook, settings |
| `claude.js` | Optional Claude picks |
| `legacy-v1/` | The earlier phrase trainer (topics, spaced repetition, role-plays), kept as a reference |

The design follows a warm "easy language" look: beige canvas, colour-blocked cards, Syne headlines (self-hosted in `fonts/`, SIL OFL licence), hand-drawn doodles, a streak calendar and a daily-goal ring.

## Learning to build it

`learning/` is a Full Stack Open style course (Node, TypeScript, React) built around the original phrase trainer, which now lives in `legacy-v1/`. File names in the course refer to that app.
