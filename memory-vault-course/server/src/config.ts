// Given: settings read once from environment variables, so the rest of the code never touches process.env.
import path from 'node:path';

export interface Config {
  port: number;
  host: string;
  dataDir: string;
  /** Use secure cookies and HSTS. Turn on when the site is served over HTTPS. */
  secure: boolean;
  /** Largest single upload in bytes. */
  maxUploadBytes: number;
}

export const COOKIE_NAME = 'vault_sid';
export const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 3000),
    host: env.HOST ?? '127.0.0.1',
    dataDir: path.resolve(env.DATA_DIR ?? 'data'),
    secure: env.COOKIE_SECURE === '1',
    maxUploadBytes: Number(env.MAX_UPLOAD_MB ?? 5000) * 1024 * 1024,
  };
}
