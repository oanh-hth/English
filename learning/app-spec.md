# The course app: Speak Natural

A mobile-first web app for learning natural American English. This is what you will have built by the end.

## Screens

| Screen | What it does |
|---|---|
| **Home** | Today's review count, streak, shortcuts to learn and practice |
| **Topics** | Search; topics grouped into sections; progress per topic |
| **Topic page** | Learn new phrases or words, practice exercises, role-plays, browse lists |
| **Phrase / word detail** | Meaning, when to use it, example dialogue, audio, add to deck, edit, delete |
| **Learn session** | Cards shown one by one; add to your deck or skip |
| **Review session** | Spaced repetition: front shows a meaning (or audio), back shows the answer; grade Again / Hard / Good / Easy |
| **Exercise session** | 10-12 generated questions; feedback; results screen |
| **Role-play** | A conversation where you build your reply from a word bank or by typing |
| **Practice** | All exercises and role-plays |
| **Resources** | External links |
| **Me** | Stats, settings, your changes, reset |

## Data shapes

```ts
type Tone = 'casual' | 'neutral' | 'polite' | 'warm' | 'urgent' | 'formal';

interface Phrase { id: string; topic: string; phrase: string; meaning: string;
  context: string; example: string /* "Line A | Line B" */; tone: Tone; sound?: string }

interface Word { id: string; topic: string; word: string; pos: string;
  meaning: string; example: string }

interface Unit { key: string; name: string; group: string; phraseTopics: string[]; wordTopics: string[]; scenarios: string[] }

interface CardState { ease: number; int: number; reps: number; due: number; lapses: number }
```

## Key behaviours to remember

- **Stable IDs.** Saved progress is keyed by item ID, so IDs never change.
- **Everything is stored on the device** (localStorage). No accounts, no server.
- **Audio** uses the browser's built-in text to speech (American English voice), started from a tap.
- **Exercises are generated** from the content, never written by hand, so more content means more questions.
- **Built-in content is read-only.** Your edits and deletes are saved as overrides.
- **Works offline** once installed.

## The reference implementation

The finished vanilla JavaScript app in the repo root is the reference. Files you will meet:

| File | Role |
|---|---|
| `data*.js`, `vocab*.js`, `units.js` | Content |
| `app.js` | Core: state, speech, scheduler, review, role-play, edit/delete |
| `units-ui.js` | Topics, topic page, exercise engine, add-item form |
| `sw.js`, `manifest.webmanifest` | Offline and install |
| `tools/validate.js` | Content checker |
