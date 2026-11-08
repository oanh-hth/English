import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { createApiClient } from './api';

/** Browser entry. `npm run dev` serves it; /api calls are proxied to `npm run server` (see vite.config.ts). */
const api = createApiClient((...args) => fetch(...args));
createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App api={api} today={new Date()} />
  </StrictMode>,
);
