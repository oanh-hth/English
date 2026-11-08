# Phase 12: Stretch projects

**Time:** open-ended · Pick one or more. Each is a real feature.

## A. "Ask Claude" with a tiny Node server
**You learn:** HTTP servers, environment variables, API proxying, CORS, rate limiting.

- [ ] A small Node server (Express or a serverless function) holds the API key in an environment variable
- [ ] The browser calls **your** endpoint, never the Claude API directly
- [ ] The server limits request size and number of requests per minute
- [ ] The key exists only in the server's environment, never in git or the browser
- [ ] Study `claude-ui.js` first, then compare how a server removes the need for each user's own key

## B. Sync across devices
**You learn:** accounts, databases, conflict resolution.

- [ ] Export and import progress as a JSON file (do this first)
- [ ] Then a backend (Supabase, Firebase or your own) with login
- [ ] Merge rule for two devices changed offline: pick one and test it

## C. Better learning algorithm
**You learn:** reading research, measuring, experimenting.

- [ ] Add a "leech" rule: cards failed 8+ times are flagged for rewriting
- [ ] Track recall rate per topic and show weak areas
- [ ] Compare two schedules on simulated data and write down which wins and why

## D. Content pipeline
**You learn:** scripting, CSV/JSON, quality control.

- [ ] A Node script that imports phrases from a spreadsheet and runs the validator
- [ ] A review workflow: a native speaker marks items, a script applies the fixes
- [ ] Study `tools/validate.js` and the "Sounds odd?" flag export in the finished app

## E. Accessibility and internationalisation
- [ ] Full keyboard use and screen-reader labels, tested with VoiceOver on iPhone
- [ ] Interface text moved into a translations file so the UI can be shown in your own language

## Final reflection
Write one page: what you built, what was hardest, what you'd change, and what you'd teach someone else first.
