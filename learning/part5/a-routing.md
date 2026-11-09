# 5a: Client-side routing

## The problem routing solves

Your app is a **single HTML page**. If screens are only state (`view = 'unit'`), then:

- Refreshing returns you to the first screen.
- The phone's back button leaves the app instead of going to the previous screen.
- You can't open "the Food topic" from a link.

**Client-side routing** maps the **URL** to what's on screen, without loading a new page from the server. Click a link, and JavaScript changes the URL (using the History API) and renders the matching component.

## Two URL styles

| Style | Example | Notes |
|---|---|---|
| Browser history | `/unit/u-cafe` | Needs the server to return `index.html` for unknown paths (called a fallback). **GitHub Pages doesn't do that.** |
| **Hash** | `/#/unit/u-cafe` | Works on any static host. The part after `#` never goes to the server. |

Because we deploy to GitHub Pages, use the **hash** router (`HashRouter`). Part 8 revisits this.

## React Router

```bash
npm i react-router-dom
```

```tsx
import { HashRouter, NavLink, Outlet, Route, Routes, useParams } from 'react-router-dom';

function Shell() {
  return (
    <>
      <main><Outlet /></main>
      <nav aria-label="Main">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/topics">Topics</NavLink>
        <NavLink to="/review">Review</NavLink>
      </nav>
    </>
  );
}

function UnitPage() {
  const { unitId } = useParams<{ unitId: string }>();
  return <h1>{unitId}</h1>;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<h1>Home</h1>} />
          <Route path="topics" element={<h1>Topics</h1>} />
          <Route path="topics/:unitId" element={<UnitPage />} />
          <Route path="*" element={<h1>Not found</h1>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
```

Concepts:

- **`<Routes>`/`<Route>`** map URL patterns to components. `:unitId` is a **parameter**.
- **Layout routes**: a `<Route element={<Shell />}>` with no path wraps its children; the child renders where `<Outlet />` is. This is how every normal screen gets the tab bar.
- **`useParams`** reads the parameter. It is always `string | undefined`: a user can type any URL, so **validate it** (look the unit up; if it doesn't exist, show "not found").
- **`NavLink`** is a link that knows whether it matches the current URL (so you can highlight the active tab). Use `Link` for plain links, and `useNavigate()` when code must navigate (for example after finishing a session).
- **`path="*"`** is the catch-all 404.

### Screens without the tab bar

Learn and Review should fill the screen. Put them in a **second layout**:

```tsx
<Routes>
  <Route element={<Shell />}> {/* with tabs */}
    <Route index element={<Home />} />
    <Route path="topics" element={<Topics />} />
  </Route>
  <Route element={<Immersive />}> {/* no tabs, just <Outlet /> */}
    <Route path="review" element={<ReviewSession />} />
  </Route>
</Routes>
```

## URL as state

Search text, selected tab, and selected topic are good candidates to put in the URL (`/topics?q=cafe`), because the page then restores itself on refresh. Use `useSearchParams` for this. Don't put secrets or large data in URLs.

## Exercises

**5.1** Install React Router. Replace your state-based `view` switching with `HashRouter` and routes for `/`, `/topics`, `/unit/:unitKey` and `*` (404).

**5.2** Make a `Shell` layout with a bottom `nav` of three `NavLink`s and an `Outlet`. Style the active link differently.

**5.3** In `UnitPage`, look the unit up from `useParams`. If it doesn't exist, render a friendly "Topic not found" with a link back. Test by typing a bad URL.

**5.4** Add an `Immersive` layout route and move your Learn session to `/learn/:unitKey/:kind` (where `kind` is `phrase` or `word`). When the session finishes, use `useNavigate` to go back to the unit page.

**5.5** Make the search box on `/topics` write to the URL (`?q=...`) with `useSearchParams`, so refreshing keeps the search. In `notes.md` explain why the hash router is used for GitHub Pages.
