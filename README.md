# Speak Natural – American English

> This repository also contains **Threadwork**, a todo list that records the result and decision of complex tasks, filed by web development topic. See [`threadwork/README.md`](threadwork/README.md).
>
> **Learn to build it yourself:** [`learn-threadwork/`](learn-threadwork/README.md) is a self-paced TypeScript, React and Node.js course that builds Threadwork part by part, with lessons, tested exercises and a progress checklist.

A mobile-first web app (installable on iPhone as a PWA) for learning the phrases native American speakers really use.

- **Learn**: 1,024 phrases in 92 topics, plus 953 daily-life words in 30 topics (Learn → Words), each with audio (normal + slow), meaning, when to use it, a mini dialogue, tone and a sound tip.
- **Review**: spaced repetition (SM-2 style: Again / Hard / Good / Easy). Cards alternate between speaking and listening.
- **Practice**: 20 role-play conversations. You see the context and a goal, then build the sentence from a word bank (or type it), then hear it and repeat it out loud.
- Works offline, no build step, no backend. Progress is stored in `localStorage`.

## Run
```
python3 -m http.server 8000   # then open http://localhost:8000
```
Host the folder on any static host (GitHub Pages, Netlify…) over HTTPS, open it in Safari on iPhone, then **Share → Add to Home Screen**.

## Audio
Uses the device's built-in text-to-speech (`speechSynthesis`, en-US). On iPhone, install an Enhanced voice for better quality: Settings → Accessibility → Spoken Content → Voices → English (US).

## Add content
Edit `data.js`: phrases are rows `[phrase, meaning, context, "A | B" example, tone, sound tip]`; append only, so saved progress stays valid. Role-plays are in `SCENARIOS`.

## Hosting on GitHub Pages
Repo → **Settings → Pages → Build and deployment → Source: Deploy from a branch**, choose the branch and folder `/ (root)`, then Save. The site appears at `https://<user>.github.io/<repo>/` after a minute. All paths are relative, so it works from the sub-path.

## Content accuracy
Phrases were written by an AI from its knowledge of American English and have **not** been reviewed by a native speaker. Verify doubtful ones with YouGlish (real video clips), COCA/Google Ngram frequencies, or a tutor, and edit `data*.js`.

## Validating content
`node tools/validate.js` checks every phrase and role-play (field counts, "A | B" examples, tones, duplicates, whether examples contain the phrase). In the app, **🏳️ Sounds odd?** flags a phrase and **Me → Copy flagged list** exports your flags so they can be corrected.

## Structure
Content is organised into **22 topics (units)** in `units.js`. Each topic combines phrase topics, vocabulary topics and role-plays. Exercises are generated automatically from every phrase and word in a topic: meaning, find-the-word, listening, fill-the-blank / finish-the-chat, build-the-phrase and dictation, plus a mixed round. Missed items are added to the spaced-repetition deck.

## Saving words you look up
**Home → Save a word I looked up** (or Topics → My words). Type the word, optionally tap *Look up meaning online* (uses the free dictionaryapi.dev service), add the meaning, and it joins your review deck. A bookmark to `index.html?add=word` opens the form directly.

## Resources tab
Edit `resources.js` to add external links (YouTube channels, podcasts…).

## YouGlish and Ask Claude
Every phrase and word has a **🔎 Hear it in real videos** box that opens YouGlish.com in the browser (link-out only, no embed). The in-app **Ask Claude** box and API-key settings are built (`claude-ui.js`, `vendor/anthropic-sdk.js`) but hidden behind `FEATURES.claude` in `app.js` until we enable it. The key would be typed on-device and kept in localStorage; never commit one.

## Secrets
No API keys or `.env` files belong in this repo (see `.gitignore`). The Claude key is typed into the app on your own device and kept only in that browser.

## Editing and deleting
Open any phrase or word and tap **✏️ Edit** or **🗑 Delete** (also on the review answer card). Changes to built-in items are saved on your device as overrides (not in the repo); **Me → Your changes** can restore deleted items or undo edits. Your own saved words are edited or deleted for real.

## Adding your own items
Open a topic and tap **Add a word or phrase** to add your own word or phrase to that topic (or to My words). It joins that topic's lists, exercises and your review deck. You can edit it later, including moving it to a different topic. Your additions are stored on your device only.
