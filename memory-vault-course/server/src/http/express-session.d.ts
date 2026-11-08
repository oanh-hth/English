// Given: tells TypeScript that the auth middleware puts the signed-in session on `req.session`.
import type { Session } from '../auth/sessions';

declare global {
  namespace Express {
    interface Request {
      session?: Session;
    }
  }
}
export {};
