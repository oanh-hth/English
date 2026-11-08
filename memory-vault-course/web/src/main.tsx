// Given: the entry point. It creates the API client once and renders <App>.
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { createApiClient } from './api/client';
import './fonts.css';
import './styles.css';

createRoot(document.getElementById('root')!).render(<App client={createApiClient()} />);
