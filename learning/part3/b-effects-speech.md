# 3b: Effects and the audio hook

## What an effect is

Rendering must be pure. But apps must also *do things* that aren't just returning JSX: talk to the browser, start timers, add event listeners. React calls these **effects**, run after the screen is updated.

```tsx
import { useEffect } from 'react';

useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // cleanup
}, []);                           // dependency array
```

- The function runs after render.
- The **dependency array** says when to re-run: `[]` = once after the first render; `[a, b]` = when `a` or `b` change; omitted = after every render.
- The **cleanup function** runs before the next run and when the component disappears. **Always clean up** listeners, timers and subscriptions, or you leak them.

Rule of thumb: if something happens *because the user did something*, put it in the **event handler**. Use an effect only to **synchronize with something outside React**.

## The browser's speech engine

`window.speechSynthesis` reads text aloud using voices installed on the device.

```ts
const u = new SpeechSynthesisUtterance('Can I get a latte, please?');
u.lang = 'en-US';
u.rate = 0.9;                 // 0.1 to 10; 0.6 is a good "slow"
speechSynthesis.speak(u);
```

Things you must know:

1. **Voices load asynchronously.** `speechSynthesis.getVoices()` can be empty at first. Listen for the `voiceschanged` event.
2. **iOS only plays audio started from a tap** (a user gesture). Call `speak` inside a click handler. Speaking from a timer or an effect on iPhone is silently ignored.
3. **Cancel before speaking** (`speechSynthesis.cancel()`), or utterances queue up and play one after another.
4. Text like `___` should be replaced before speaking ("something").
5. Quality varies by device. On iPhone, Settings → Accessibility → Spoken Content → Voices lets you download better English (US) voices.

## A custom hook

A **hook** is a function whose name starts with `use` that calls other hooks. Extracting `useSpeech` keeps components simple and reusable:

```ts
// src/useSpeech.ts
import { useCallback, useEffect, useState } from 'react';

export function useSpeech(rate = 0.9) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const load = () => setVoices(speechSynthesis.getVoices().filter(v => v.lang.startsWith('en')));
    load();
    speechSynthesis.addEventListener('voiceschanged', load);
    return () => speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  const speak = useCallback((text: string, slow = false) => {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/___/g, 'something'));
    u.lang = 'en-US';
    const voice = voices.find(v => /en[-_]US/i.test(v.lang));
    if (voice) u.voice = voice;
    u.rate = slow ? 0.6 : rate;
    speechSynthesis.speak(u);
  }, [voices, rate]);

  return { speak, voices };
}
```

Study it line by line: the effect has a cleanup; `useCallback` keeps `speak` stable between renders unless its inputs change.

Use it inside a click handler:

```tsx
function reveal() {
  setRevealed(true);
  speak(phrase.phrase);   // runs inside the tap, so iOS allows it
}
```

## Exercises

**3.6** Write `useSpeech` yourself (don't copy the text above; read it once, close it, write it). Add a "Play" button to `Flashcard`'s back.

**3.7** Add a **slow** button (rate 0.6) and a button that plays the example dialogue's two lines one after the other (hint: `utterance.onend` can start the next one).

**3.8** Stop audio when the card changes or the component unmounts (hint: `useEffect` cleanup calling `speechSynthesis.cancel()`).

**3.9** Open the page on your iPhone. Verify that tapping plays audio. Then, as an experiment, try calling `speak` from a `setTimeout` instead of a tap and describe in `notes.md` what happens on iOS.

**3.10** Add a voice picker listing `voices`; remember the chosen voice name in state and use it in `speak`. (Persisting it comes in Part 4.)
