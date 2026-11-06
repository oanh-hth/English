# Speak Natural – American English

A mobile-first web app (installable on iPhone as a PWA) for learning the phrases native American speakers really use.

- **Learn**: 313 phrases in 39 topics, each with audio (normal + slow), meaning, when to use it, a mini dialogue, tone and a sound tip.
- **Review**: spaced repetition (SM-2 style: Again / Hard / Good / Easy). Cards alternate between speaking and listening.
- **Practice**: 15 role-play conversations. You see the context and a goal, then build the sentence from a word bank (or type it), then hear it and repeat it out loud.
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
