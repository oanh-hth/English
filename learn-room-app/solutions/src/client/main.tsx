import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { createApiClient } from './api';
import { Gallery } from './Gallery';

/**
 * Browser entry. `npm run dev` serves it.
 *   http://localhost:5173/           the real app (needs `npm run server`)
 *   http://localhost:5173/#gallery   every component with example data (no server needed)
 * /api calls are forwarded to the server (see vite.config.ts).
 */
const api = createApiClient((...args) => fetch(...args));
const root = createRoot(document.getElementById('root') as HTMLElement);

function render() {
  root.render(<StrictMode>{location.hash === '#gallery' ? <Gallery /> : <App api={api} today={new Date()} />}</StrictMode>);
}
window.addEventListener('hashchange', render);
render();
