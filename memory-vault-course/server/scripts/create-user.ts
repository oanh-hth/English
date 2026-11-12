// Given: npm run create-user -w server -- alice   (the password is read from the VAULT_PASSWORD variable)
import path from 'node:path';
import { hashPassword } from '../src/auth/password';
import { loadConfig } from '../src/config';
import { openDb } from '../src/db/schema';
import { UserRepo } from '../src/db/userRepo';

const username = process.argv[2];
const password = process.env.VAULT_PASSWORD;
if (!username || !password || password.length < 12) {
  console.error('Usage: VAULT_PASSWORD="at least 12 characters" npm run create-user -w server -- <username>');
  process.exit(1);
}
const config = loadConfig();
const users = new UserRepo(openDb(path.join(config.dataDir, 'vault.db')));
if (users.findByUsername(username)) {
  console.error(`User "${username}" already exists.`);
  process.exit(1);
}
users.create(username, await hashPassword(password));
console.log(`User "${username}" created.`);
