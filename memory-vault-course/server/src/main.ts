// Given: starts the real server. Run it with `npm run dev:server`.
// Files go to the local disk here. Exercise 7.2 builds a cloud driver; connecting it to a real bucket is a deployment step.
import path from 'node:path';
import { createApp } from './app';
import { LoginLimiter } from './auth/loginLimiter';
import { SessionStore } from './auth/sessions';
import { loadConfig } from './config';
import { openDb } from './db/schema';
import { createLocalStorage } from './storage/localStorage';

const config = loadConfig();
const db = openDb(path.join(config.dataDir, 'vault.db'));
const storage = createLocalStorage(path.join(config.dataDir, 'files'));
const app = createApp({ config, db, storage, sessions: new SessionStore(), limiter: new LoginLimiter() });

app.listen(config.port, config.host, () => {
  console.log(`Memory Vault API on http://${config.host}:${config.port}`);
  console.log('Create an account with: npm run create-user -w server -- <username>');
});
