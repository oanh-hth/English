# Phase 3: State, events & audio

**Time:** 5–7 hours · **You build:** a flashcard that flips and speaks the phrase.

## 1. Learn
- **State**: `useState`, updating objects and arrays immutably, why you never mutate state directly.
- **Events**: `onClick`, `onChange`, controlled inputs.
- **Effects**: `useEffect`, dependency arrays, cleanup functions.
- **Custom hooks**: extract `useSpeech()`.
- **Web Speech API**: `speechSynthesis`, `SpeechSynthesisUtterance`, `getVoices()`, the `voiceschanged` event, `rate`, and why iOS needs speech to start from a tap.

## 2. Study the finished app
- `app.js`: the `TTS` object (`init`, `pick`, `speak`), and `VIEWS.session` for the front/back of a card.
- Note how it picks an en-US voice and slows speech to 0.6 for the slow button.

## 3. Exercise
- [ ] `useSpeech()` returns `{ speak(text, slow?), voices }` and handles async voice loading
- [ ] `Flashcard` shows the meaning on the front; "Show answer" reveals the phrase
- [ ] Revealing plays the phrase aloud; a slow button plays it at 0.6×
- [ ] Next/previous buttons move through the sample phrases
- [ ] Switching cards cancels audio that is still playing
- [ ] Works on your iPhone, with audio started from a tap

## 4. Check yourself
1. Why does `getVoices()` often return an empty list on first call?
2. What goes wrong if an effect forgets its cleanup?
3. Why is `setCards([...cards, x])` right and `cards.push(x)` wrong?
4. Where would you store "which card is showing": parent or child?
