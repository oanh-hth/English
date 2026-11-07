// Usage: npm run create-user -- <username>
// There is deliberately no public sign-up: accounts are created only by whoever controls the server.
import readline from 'node:readline';
import { db } from '../src/db.js';
import { hashPassword } from '../src/auth.js';

const username = (process.argv[2] || '').trim();
if (!/^[A-Za-z0-9_.-]{3,32}$/.test(username)) {
  console.error('Usage: npm run create-user -- <username>   (3-32 chars: letters, digits, _ . -)');
  process.exit(1);
}

function askHidden(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(prompt)) rl.output.write(s); }; // do not echo typed characters
    rl.question(prompt, (a) => { rl.close(); process.stdout.write('\n'); resolve(a); });
  });
}

const fromEnv = process.env.VAULT_PASSWORD;
const pw = fromEnv || await askHidden('Password (min 12 chars): ');
if (!fromEnv) {
  const again = await askHidden('Repeat password: ');
  if (pw !== again) { console.error('Passwords do not match.'); process.exit(1); }
}
if (pw.length < 12) { console.error('Password must be at least 12 characters.'); process.exit(1); }

const hash = await hashPassword(pw);
const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
if (existing) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, existing.id);
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(existing.id);
  console.log(`Password updated for "${username}" (all their sessions were signed out).`);
} else {
  db.prepare('INSERT INTO users (username,password_hash,created_at) VALUES (?,?,?)').run(username, hash, Date.now());
  console.log(`User "${username}" created.`);
}
