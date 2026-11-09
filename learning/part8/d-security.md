# 8d: Secrets and security hygiene

## The most important rule

**A website cannot keep a secret.** Everything you ship, JavaScript, HTML, JSON, source maps, is downloaded by every visitor, who can read it. Anything placed there is public.

So: **never put API keys, passwords or tokens in your front-end code or repo.** This course app needs no secret at all; keep it that way.

## The `VITE_` trap

Vite exposes environment variables to the browser **only** if they start with `VITE_`:

```
VITE_API_KEY=abc   # ends up inside your public JavaScript file!
API_KEY=abc        # stays out of the bundle
```

Developers often write `VITE_API_KEY` to "make it work" and ship a secret by accident. Rule: if a value must stay private, **the browser must never need it**. Put it behind a small server (Part 9), which holds the key in its own environment and exposes a narrow endpoint.

## `.env` files and `.gitignore`

`.env` files hold local settings. They must never be committed:

```
# .gitignore
.env
.env.*
!.env.example
*.key
*.pem
```

Commit an `.env.example` with **fake** values so teammates know which variables exist.

## Checking what you're about to commit

Before every commit read `git status` and `git diff --staged`. Add safety nets:

```bash
git ls-files | grep -iE "\.env|secret|key|credential"      # unexpected sensitive files?
git grep -nI -E "(api[_-]?key|secret|token)\s*[:=]\s*['\"][A-Za-z0-9_-]{16,}"   # key-like strings
git log --all -p -S"sk-" --oneline | head                   # search the whole history
```

Tools like **gitleaks** or GitHub **secret scanning** automate this; turn on secret scanning in the repo's settings.

## If a secret leaks

Treat it as compromised the moment it's pushed (bots scrape GitHub within minutes). In this order:

1. **Revoke the key** with the provider (Anthropic Console, GitHub tokens page...). Deleting the file does **not** help: the secret is in git history and forks.
2. Create a new key; update the server's environment.
3. Look at the provider's usage logs for misuse.
4. Only then clean history (`git filter-repo`) if you must, remembering that revocation is the real fix.

## Other hygiene

- **Dependencies:** run `npm audit`; keep the lockfile; update regularly (Dependabot can open pull requests).
- **Least privilege:** workflows get only the permissions they need (see 8c).
- **User data:** this app keeps data on the device; say so, and don't add analytics or third-party scripts without telling users.
- **Third-party content:** treat anything imported or fetched as untrusted. React escapes text; never use `dangerouslySetInnerHTML` with it.
- **Content Security Policy** (a header or `<meta>` listing allowed script sources) limits damage if something injects code.

## Exercises

**8.16** Write `.gitignore` with the patterns above and an `.env.example` containing only fake values. Confirm with `git status` that a real `.env` you create would be ignored (`git check-ignore -v .env`).

**8.17** Run the three scanning commands on your repo. Report what they found (hopefully nothing) and explain each in your own words.

**8.18** Create a **fake** key (`sk-test-0000000000000000`), commit it on a throwaway branch, find it with `git grep`, then practise the response: explain the steps you'd take if it were real. Delete the branch.

**8.19** Run `npm audit` and `npm outdated`. Decide which updates to take and why.

**8.20** In `notes.md` answer: why does deleting a leaked key from the repository not make you safe? What is the `VITE_` trap? What's the difference between a key in your browser app and a key on a server? Then `git tag part8`.
