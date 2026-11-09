# 6d: Role-plays

A role-play is a short conversation. The other person speaks; you get a **goal** ("Order a medium iced latte, politely") and must produce a natural sentence. It trains *producing* English, not just recognizing it.

## The data

```json
{
  "id": "cafe", "title": "Ordering at a café", "level": "Beginner",
  "setting": "You walk up to the counter at a busy coffee shop.",
  "turns": [
    { "npc": "Hi there! What can I get started for you?",
      "n": "Order a medium iced latte, politely.",
      "a": "Can I get a medium iced latte, please?",
      "alts": ["Could I get a medium iced latte, please?", "I'll have a medium iced latte, please."],
      "x": ["want", "would"],
      "tip": "\"Can I get...?\" is the most natural way to order." }
  ]
}
```

| Field | Meaning |
|---|---|
| `npc` | what the other person says (played aloud) |
| `n` | your goal, in plain English |
| `a` and `alts` | **all accepted answers** (the first is the model answer) |
| `x` | extra "decoy" words for the word bank |
| `tip` | one language note shown after you succeed |

Why several accepted answers? Natural speech has many correct ways to say a thing. Accepting only one would mark good English as wrong.

## Building the word bank

The bank must contain every word needed by **any** accepted answer, plus decoys, with the right **counts** (an answer that uses "I" twice needs two "I" tiles):

```ts
function buildBank(turn: Turn, rand = Math.random): string[] {
  const maxCount = new Map<string, number>();
  const shown = new Map<string, string>();
  for (const ans of [turn.a, ...(turn.alts ?? [])]) {
    const counts = new Map<string, number>();
    for (const w of tokens(ans)) {
      const k = w.toLowerCase();
      counts.set(k, (counts.get(k) ?? 0) + 1);
      if (!shown.has(k)) shown.set(k, w);
    }
    for (const [k, c] of counts) maxCount.set(k, Math.max(maxCount.get(k) ?? 0, c));
  }
  const words: string[] = [];
  for (const [k, c] of maxCount) for (let n = 0; n < c; n++) words.push(shown.get(k)!);
  for (const w of turn.x ?? []) if (!maxCount.has(w.toLowerCase())) words.push(w);
  return shuffle(words, rand);
}
```

This is the trickiest function in the app. Write it **test first**: for each accepted answer, a bank built from the turn can spell it.

## Checking and feedback

Use your `isCorrect(attempt, [a, ...alts])`. Then:

- **Correct:** add your sentence to the chat, speak it, show the `tip`, and a Continue button.
- **Wrong:** shake the answer area and show "Not quite". After a second wrong try, reveal the first word as a hint (and offer "Show answer").
- Score a turn as *clean* only if there were no wrong tries and no full-answer reveal.

## Two input modes

A toggle between **Word bank** (tap tiles) and **Type** (a text input). Tiles are easier; typing is harder and better practice. Remember the learner's choice between turns.

## Flow

```
setting → npc line (spoken) → goal → learner answers → correct → tip → Continue → next turn ... → summary
```

Chat bubbles: the NPC on the left, you on the right. The conversation history is simply an array of `{ who: 'npc' | 'me', text }`.

At the end, offer **"Play full conversation"** (speak each line in turn) and read-aloud practice: the learner reads their own lines along with the audio. That last step is where speaking skill actually grows.

## Exercises

**6.17** Create types for `Scenario` and `Turn` and test `buildBank` first (every accepted answer can be spelled from the bank; counts are right; decoys are included once).

**6.18** Write a role-play reducer (history, turn index, built tiles, tries, hint level, status) with tests: correct answer advances; wrong shakes; second wrong reveals the hint; a clean-turn counter.

**6.19** Build the role-play screen: setting, bubbles, goal card, tiles and Type mode, Check, Hint, Clear, tip after success, summary with score.

**6.20** Add "Play full conversation" (speak each line one after another).

**6.21** Show the scenarios on the Practice page and in each unit; record "best score" per scenario in the store. Compare with `roleplayView`, `rpCheck` and `beginTurn` in the finished app's `app.js`, then `git tag part6`.
