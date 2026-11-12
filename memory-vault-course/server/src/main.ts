// Given: starts the real server. Run it with `npm run dev:server`.
//   AUTH=dev (default)  everyone is a pre-made "dev" user, no password. Use this in parts 1 to 5.
//   AUTH=real           real sign-in (part 6). Create accounts first:  npm run create-user -w server -- alice
// Files go to the local disk here. Part 7 builds a cloud driver; connecting it to a real bucket is a deployment step.
import path from 'node:path';
import { createApp } from './app';
import { LoginLimiter } from './auth/loginLimiter';
import { SessionStore } from './auth/sessions';
import { devAuth, realAuth, type AuthStrategy } from './auth/strategies';
import { loadConfig } from './config';
import { openDb } from './db/schema';
import { UserRepo } from './db/userRepo';
import { createLocalStorage } from './storage/localStorage';

const config = loadConfig();
const db = openDb(path.join(config.dataDir, 'vault.db'));
const storage = createLocalStorage(path.join(config.dataDir, 'files'));
const users = new UserRepo(db);

let auth: AuthStrategy;
if (process.env.AUTH === 'real') {
  auth = realAuth({ users, sessions: new SessionStore(), limiter: new LoginLimiter(), config });
} else {
  const dev = users.findByUsername('dev');
  const id = dev ? dev.id : users.create('dev', 'not-a-real-hash');
  auth = devAuth({ id, username: 'dev' }, config);
}

createApp({ config, db, storage, auth }).listen(config.port, config.host, () => {
  console.log(`Memory Vault API on http://${config.host}:${config.port}  (sign-in: ${process.env.AUTH === 'real' ? 'real' : 'dev user, no password'})`);
});
