# Part 9: Going further

You now have the finished app. This part is a menu of real next steps. Each project below is a **mini-course**: a goal, the knowledge you need, a build plan and a checklist. Pick one (or all) and ship it.

| Project | You learn |
|---|---|
| [A. An AI helper behind a server](#a-an-ai-helper-behind-a-server) | HTTP servers, environment variables, API design, rate limiting |
| [B. Sync across devices](#b-sync-across-devices) | accounts, databases, conflict resolution |
| [C. A better learning algorithm](#c-a-better-learning-algorithm) | measuring, simulation, reading research |
| [D. Content quality pipeline](#d-content-quality-pipeline) | scripting, review workflows |
| [E. Accessibility and translation](#e-accessibility-and-translation) | screen readers, i18n |

## Final checkpoint

- [ ] Your app matches [`../app-spec.md`](../app-spec.md) and runs from your GitHub Pages URL
- [ ] Every checkpoint tag `part0` to `part8` exists in your git history
- [ ] You can explain every file in your project to someone else
- [ ] You wrote the one-page reflection below

---

## A. An AI helper behind a server

**Goal:** an "Ask about this phrase" box where the **API key never reaches the browser.**

**Why a server:** a browser app can't hide a key (8d). A small Node server holds the key and answers only the narrow question your app needs.

**Knowledge:** Node HTTP servers (Express), JSON APIs, environment variables, CORS, input validation, rate limiting, deployment of a server (Render, Fly.io, a Cloudflare Worker or similar).

A minimal server (TypeScript, Node 20+):

```ts
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(express.json({ limit: '10kb' }));
const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the server's environment

app.post('/api/ask', async (req, res) => {
  const { item, question } = req.body as { item?: string; question?: string };
  if (!item || !question || question.length > 500) {
    res.status(400).json({ error: 'bad request' });
    return;
  }
  try {
    const msg = await client.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 1024,
      output_config: { effort: 'low' },
      system: 'You are a concise American English coach. Say if a phrase is unnatural, dated or British. Give two natural examples.',
      messages: [{ role: 'user', content: `Item: "${item}"\nQuestion: ${question}` }],
    });
    const text = msg.content.flatMap(b => (b.type === 'text' ? [b.text] : [])).join('\n');
    res.json({ text });
  } catch {
    res.status(502).json({ error: 'upstream error' });
  }
});

app.listen(3001);
```

Run it with the key in your **shell environment**, never in a file in git:

```bash
ANTHROPIC_API_KEY=... npx tsx server.ts
```

Build plan:

- [ ] Server holds the key only in an environment variable; `.env` is git-ignored
- [ ] Input validation: length limits, required fields
- [ ] **Rate limiting** (for example `express-rate-limit`) and a daily cap, because every request costs money
- [ ] CORS allows only your site's origin
- [ ] The React app calls your endpoint, shows "Thinking…", errors and answers (render as text, never as HTML)
- [ ] You can explain the cost of one request and how you'd cap monthly spend
- [ ] You tested what happens when the server is down (the rest of the app still works)

Choose the model deliberately: a larger model is better at nuance; a smaller one is cheaper and faster. Measure on a dozen real questions before deciding.

## B. Sync across devices

**Goal:** the same deck on phone and laptop.

**Knowledge:** authentication, a database (Supabase, Firebase or your own Postgres), REST or realtime APIs, **conflict resolution** (what if both devices changed the same card offline?).

Plan: start with the **export/import** you built; then add a backend with login; define a merge rule for two versions of a card (for example "the one with the later `lastReviewedAt` wins"); test with two browsers and airplane mode.

## C. A better learning algorithm

**Goal:** decide with evidence whether a change helps.

Plan: log each review (`id`, `grade`, `interval`, `time`); write a **simulator** that replays a model learner (who forgets with a probability depending on interval) against your scheduler and a variant (different multipliers, a "leech" rule for cards failed 8 or more times); compare how many reviews each needs for the same recall. Read about SM-2 and about FSRS, a newer, memory-model-based scheduler.

## D. Content quality pipeline

**Goal:** make the content trustworthy.

Plan: a script that exports flagged items; a review sheet (spreadsheet) that a native speaker marks; a script that applies corrections to the data files and runs the validator; a checklist for each new topic (frequency check, register labelled, example natural, no near-duplicates).

## E. Accessibility and translation

**Goal:** more people can use it.

Plan: full keyboard operation; VoiceOver labels and focus management in sheets; reduced motion; a translations file for interface text (`en.json`, `vi.json`...) with a language switcher; test with real users if you can.

---

## Final reflection

Write one page in `notes.md`:

1. What you built, in three sentences.
2. The hardest bug and how you found it.
3. Two decisions you'd make differently.
4. What you would teach a friend first, and why.
