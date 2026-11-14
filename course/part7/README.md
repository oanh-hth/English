# Part 7: The full stack front end

**Goal.** The React app logs people in, shows their garden, runs flashcard reviews against your API and shows the review schedule, on phones and iPads.

**You will learn:** client-side routing, auth state and protected routes, a fetch wrapper that attaches tokens, reducers for multi-step flows, and accessible, responsive UI.

Work in `word-garden/frontend`.

## a. Routing and layout

A **single page app** changes what is on screen without loading a new page. **React Router** maps URLs to components so the back button, bookmarks and reloads work.

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route element={<RequireAuth><AppLayout /></RequireAuth>}>   {/* layout route: tab bar + <Outlet /> */}
      <Route index element={<Garden />} />
      <Route path="review" element={<Review />} />
      <Route path="notes" element={<Notes />} />
      <Route path="me" element={<Me />} />
    </Route>
    <Route path="/review/session" element={<RequireAuth><ReviewSession /></RequireAuth>} />   {/* no tab bar */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

A **layout route** wraps child routes with shared UI (the tab bar) via `<Outlet />`. The immersive review session sits outside it, so the tab bar hides.

The server must return `index.html` for unknown non-API paths (you did this in Part 3), otherwise refreshing `/notes` is a `404`.

### Exercises

**7.1.** Install `react-router-dom` and create the routes above with placeholder screens.

**7.2.** Turn your tab bar into `NavLink`s so the active tab is styled from the URL (not from state).

**7.3.** Build `AppLayout` with the tab bar and an `<Outlet />`. On a phone the bar is at the bottom with safe-area padding. On an iPad in landscape, keep it centered and narrow, as in the reference.

**7.4.** Add a `NotFound` screen, and a **review badge** on the Review tab showing how many notes are due (from a query you write in lesson c).

**7.5.** Reload `/notes` in production mode (`npm run build`, then your Express server). It must work. If it does not, fix the server catch-all from Part 3.

## b. Auth in the browser

The front end needs to: show login and sign-up, keep the token, send it on every request, and react when the server says `401` (the token expired).

```tsx
type Auth = { token: string | null; user: User | null; login(u: string, p: string): Promise<void>; logout(): void };
const AuthContext = createContext<Auth | null>(null);
export const useAuth = () => { const c = useContext(AuthContext); if (!c) throw new Error('useAuth outside provider'); return c; };
```

**Context** passes a value to any descendant without threading props through every level. Use it for things that are truly global (the logged-in user), not for everything.

Where to keep the token? You decided in 6.11. With `localStorage`: read it once at start-up, write it on login, remove it on logout. Wrap `localStorage` in try/catch, because it can throw in private windows.

In `api.ts`, add the header from the stored token, and on a `401` response **log out** (clear the token and the query cache, redirect to login).

```tsx
function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const loc = useLocation();
  return token ? children : <Navigate to="/login" state={{ from: loc }} replace />;
}
```

### Exercises

**7.6.** Write `AuthProvider` with `login`, `signup` and `logout`. Persist the token.

**7.7.** Build the `Login` and `Signup` forms: labelled inputs, `autocomplete="username"` / `"current-password"` / `"new-password"` (so password managers work), disabled button while pending, server errors shown clearly.

**7.8.** Add the `Authorization` header in `api.ts`. On `401`, log out and clear the TanStack Query cache (`queryClient.clear()`) so the next user never sees the last user's data. Test by manually breaking the token.

**7.9.** `RequireAuth` redirects to `/login` and, after login, returns the user to the page they wanted (`state.from`).

**7.10.** Show the username and a **Log out** button on the Me screen. Add the **review pace** setting (5, 8, 10, 15, 20) saving through `PUT /api/me`.

**7.11.** Explain in `NOTES.md` one XSS attack that would steal the token from `localStorage`, and list three things in this app that stop it.

## c. The review session

This is the heart of the app. A session is a small **state machine**: a queue of notes, a current index, "answer hidden" or "answer shown", and a list of results. Several fields change together, so use `useReducer` rather than five `useState` calls:

```tsx
type State = { queue: Note[]; i: number; shown: boolean; counts: [number, number, number, number]; done: boolean };
type Action = { type: 'reveal' } | { type: 'grade'; grade: Grade };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'reveal': return { ...s, shown: true };
    case 'grade': {
      const counts = s.counts.map((c, g) => (g === a.grade ? c + 1 : c)) as State['counts'];
      const queue = a.grade === 0 ? [...s.queue, s.queue[s.i]!] : s.queue;      // "again" comes back once
      const i = s.i + 1;
      return { ...s, queue, i, shown: false, counts, done: i >= queue.length };
    }
  }
}
```

A reducer is a **pure function**, so it gets unit tests without rendering anything. The component calls `dispatch`, and a mutation sends each grade to `POST /api/notes/:id/reviews`.

**UX details that matter:** show the next interval on each grade button (the server returns previews with the due list), keep the answer's audio button a real `<button>`, move focus to the answer after reveal, and announce results with `aria-live`.

### Exercises

**7.12.** Write the `reducer` and a test file for it: reveal, grade, "again" re-queues once, finishing flips `done`.

**7.13.** Build the `ReviewSession` screen: progress bar, the card (meaning, or the gapped example when there is no meaning), **Show answer**, then the four grade buttons.

**7.14.** Add `GET /api/reviews/due` previews on the server (the days each grade would give) and show them on the buttons: `Again 1d, Hard 2d, Good 7d, Easy 14d`.

**7.15.** Send each grade with a mutation. If one fails (offline), keep the card in the queue and show a retry, so a review is never lost silently.

**7.16.** Build the finished screen: counts per grade, the next review date, a button back to the Garden. Invalidate `['notes']`, `['due']`, `['schedule']` and `['garden']`.

**7.17.** Build the **Review** tab: the number due, a Start button, the due list, and the 21-day schedule as bars (width = count / daily cap) with up to four note chips per day.

**7.18.** Add **Review ahead** (the next 10 notes when nothing is due).

**7.19.** Make keyboard users happy: the session works with `Space` to reveal and `1`-`4` to grade, with visible focus rings. Test with only a keyboard.

**7.20.** Check the whole front end at 390 px, 810 px and 1194 px wide. Fix overflow. Notes become two columns on an iPad portrait and three in landscape.

## Checkpoint 7

- [ ] Sign up, log in, add notes, review them, see the schedule, log out, all against your server.
- [ ] The token is never logged. A `401` always lands on the login screen with a clean cache.
- [ ] The review reducer has tests. A failed grade is never lost.
- [ ] It looks right on a phone and an iPad in both orientations, and works by keyboard.

Tag it: `git tag part7`. This is a usable app: use it daily for a week.

**Reference:** `session.js` and `views.js` (review parts) at the repository root.
