# Part 0: Getting ready

**Goal.** By the end you have the tools installed, an empty repository on GitHub, a clear picture of what you will build, and the finished reference app running on your machine.

**You will learn:** how the web works at the level a developer needs, how to read the app spec, how to plan a data model before writing code.

## a. Tools and the repository

You need four things installed. Check each in a terminal.

| Tool | Check | Why |
|---|---|---|
| Node.js 22 (use `nvm` or `fnm`) | `node -v` | runs the server, the build tools and the tests |
| Git | `git --version` | history and collaboration |
| Docker Desktop (or Docker Engine) | `docker --version` | runs PostgreSQL without installing it |
| VS Code | opens | editor, with the ESLint and Prettier extensions |

**The terminal** is the main tool of this course. You need `cd`, `ls`, `mkdir`, `cat`, and to know that `Ctrl+C` stops a running program.

**npm** installs libraries into `node_modules/` and records them in `package.json`. `package-lock.json` pins the exact versions, so commit it. Never commit `node_modules/`.

**`.gitignore`** lists files git must never track. For this project start with:

```
node_modules/
dist/
.env
.env.*
!.env.example
*.log
.DS_Store
```

`.env` holds secrets (passwords, tokens). Once a secret is in git history it is public in practice, even if you delete it later. Rotating a leaked secret is the only fix. Build the habit now.

### Exercises

**0.1.** Install the four tools. Paste the output of `node -v`, `git --version` and `docker --version` into a file `NOTES.md`.

**0.2.** Create a folder `word-garden`, run `git init`, and add the `.gitignore` above plus a `README.md` with one sentence about the app. Commit with the message `Start the project`.

**0.3.** Create an empty repository on GitHub (no README, no license), connect it with `git remote add origin ...`, and push. Check that your `.gitignore` is visible on GitHub.

**0.4.** Create a file `.env.example` containing `DATABASE_URL=postgres://garden:garden@localhost:5432/wordgarden`. Explain in `NOTES.md` why `.env.example` is committed but `.env` is not.

## b. The web in ten minutes

- A **client** (your browser) sends an **HTTP request**: a method (`GET`, `POST`, `PUT`, `DELETE`), a URL, headers, maybe a body. A **server** sends back an **HTTP response**: a status code, headers, a body.
- **Status codes** you will use: `200` OK, `201` created, `204` no content, `400` bad input, `401` not logged in, `403` forbidden, `404` not found, `409` conflict, `429` too many requests, `500` server bug.
- **JSON** is how the two sides exchange data: `{"text": "hang out", "kind": "phrase"}`.
- A **single page app** (SPA) is one HTML page plus JavaScript that draws screens and calls a JSON API. That is what you build.
- **Same-origin policy.** A page may only call another origin if that server allows it (CORS). In development you avoid the problem with a proxy.
- The **browser** and **Node.js** both run JavaScript but offer different tools. The browser has the DOM, `fetch`, speech and the microphone. Node has the file system, the network server and the database drivers.

### Exercises

**0.5.** Open any website, press F12, open the **Network** tab, reload. Pick three requests and write down method, URL, status and what the response body is.

**0.6.** In a terminal run:

```bash
curl -i "https://api.open-meteo.com/v1/forecast?latitude=21.03&longitude=105.85&current=weather_code,is_day,temperature_2m"
```

Identify the status line, two headers and the JSON body. Which field is the weather code? (You will map it to a sky in Part 3.)

**0.7.** Run `curl -i -X POST https://httpbin.org/post -H "Content-Type: application/json" -d '{"text":"hang out"}'` and find your JSON in the answer. What changes if you leave out the `Content-Type` header?

**0.8.** Write five sentences in `NOTES.md` explaining the difference between the client, the server and the database, using a flashcard review as the example.

## c. Meet the app and plan it

Run the finished reference app (it lives at the repository root):

```bash
python3 -m http.server 8123
# open http://localhost:8123
```

Use it like a learner: pick a plant, add notes, open the Review tab, try the sentence and speaking practice.

Then read [`../app-spec.md`](../app-spec.md). Pay attention to the **data model** and the **API table**. A good habit before any project: **list the nouns** (user, note, review, plant, point event, mission) and **the verbs** (add a note, review it, water the plant). Nouns become tables, verbs become endpoints.

The reference app keeps everything in the browser. Your version will keep everything in a database behind a server. Ask yourself while you use it: *which of these things must the server decide, and which can the browser decide?* (Hint: anything that must be fair or shared, like "today" and "points", belongs to the server.)

### Exercises

**0.9.** Use the reference app until you have added 10 notes and finished one review. Write down three things you like and three that confuse you.

**0.10.** On paper, draw the data model from the spec **without looking at the diagram**: boxes for the nouns, lines for the relationships, and for each line say "one to many" or "many to many". Compare with the diagram in `app-spec.md`.

**0.11.** From the screens table, write the list of API endpoints you think you need. Compare with the API table. Which did you miss? Which did you add that the spec does not have?

**0.12.** Create the project skeleton:

```
word-garden/
  backend/    (npm init -y)
  frontend/   (empty for now)
  NOTES.md
  README.md
```

Commit it.

**0.13.** In `NOTES.md` write a one-page plan: your target date for each part (use the table in the course README), and the one thing you most want to learn.

## Checkpoint 0

- [ ] Node, Git and Docker are installed and verified.
- [ ] The repository is on GitHub with `.gitignore` and `.env.example`.
- [ ] You can explain what happens between clicking a button and a row appearing in a database.
- [ ] `NOTES.md` has your data model sketch and a plan.

Tag it: `git tag part0 && git push --tags`.
