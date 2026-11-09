# 0c: Meet the course app

Before you build something, you should use it. This lesson has no new theory, just careful observation: the habit of **reading a product like an engineer**.

## Run the finished app

From the root of this repository:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` (use your phone's browser too: `http://<your-computer-ip>:8000`). It is a static site; no build step.

Read [`../app-spec.md`](../app-spec.md) now.

## What to look for

As you use each screen, ask: **what data is on the screen, where did it come from, and what happens to it when I tap?**

- **Home:** what numbers does it show? Which of them change when you review a card?
- **Topics → a topic page:** what is a "topic" made of? How does the progress bar know its value?
- **Learn:** what changes after you tap "Add to my deck"?
- **Review:** the four buttons show times. What does each button do to the card?
- **Practice:** which exercise types exist? What happens to the questions you miss?
- **Edit and delete:** do they change the original data? How can you get it back?
- **Reload the page.** What survives? What doesn't?

## Make a plan

Large projects are built by slicing them into small, working pieces. The course already did the slicing: each part ends with an app that runs. Your job in this lesson is to make the *what* concrete in your own words, so the parts that follow make sense.

## Exercises

**0.9** Use the finished app for 30 minutes. In `notes.md`, list every feature you found as a bullet point, in your own words (aim for at least 20).

**0.10** Sort your feature list into three groups: **must have** (study loop), **should have** (practice and polish), **nice to have** (extras). Compare with the part list in [`../README.md`](../README.md). Where do you disagree with the course order, and why?

**0.11** Sketch (paper is fine) four screens: Topics, Topic page, Review back, Exercise question. For each, write the data it needs as a short list (for example: "topic name, count of phrases, count in deck").

**0.12** Copy the folder `learning/sample-data/` into your project as `src/data/`. Open each JSON file and write one sentence about each field. Commit, then `git tag part0`.
