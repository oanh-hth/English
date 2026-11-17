import { createApp } from './app.js';
import { connect, migrate } from './db.js';

const env = process.env, prod = env.NODE_ENV === 'production';
const need = name => { if (!env[name]) { console.error(`Missing environment variable ${name}. See .env.example.`); process.exit(1); } return env[name]; };

const jwtSecret = need('JWT_SECRET');
if (jwtSecret.length < 32) { console.error('JWT_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 48'); process.exit(1); }
// In production you must say which site may call this server (your GitHub Pages address).
const corsOrigins = (prod ? need('CORS_ORIGIN') : env.CORS_ORIGIN || '*').split(',').map(s => s.trim()).filter(Boolean);

const db = connect(need('DATABASE_URL'));
await migrate(db);
const app = createApp(db, { jwtSecret, corsOrigins, trustProxy: prod || env.TRUST_PROXY === '1' });
const port = Number(env.PORT || 8787);
app.listen(port, () => console.log(`Lexigrow sync listening on ${port}`));
