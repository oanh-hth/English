// EXERCISE 6.3: login lockout. Make `npm run ex -- 6.3` pass.
//
// Without a limit, someone could try millions of passwords. After too many wrong tries we refuse for a while.
// We count failures per "key". The server uses two keys for one login attempt: the visitor's address ("ip:1.2.3.4")
// and the username ("user:alice"), so guessing one account from many addresses, or many accounts from one address,
// both get stopped.

export interface LoginLimiterOptions {
  /** Failures allowed before locking. Default 5. */
  maxFails?: number;
  /** How long a lock lasts in milliseconds. Default 15 minutes. */
  lockMs?: number;
  /** The clock (tests pass a fake). Default Date.now. */
  now?: () => number;
}

export class LoginLimiter {
  // Hint: Map<string, { count: number; lockedUntil: number }>

  constructor(options: LoginLimiterOptions = {}) {
    // Save the options with their defaults.
  }

  /** True when ANY of the keys is currently locked. */
  isLocked(keys: string[]): boolean {
    throw new Error('Not implemented: LoginLimiter.isLocked');
  }

  /**
   * Count one failed login for EVERY key.
   * When a key reaches maxFails, lock it until now + lockMs and reset its counter to 0.
   */
  recordFailure(keys: string[]): void {
    throw new Error('Not implemented: LoginLimiter.recordFailure');
  }

  /** A successful login: forget the failures and locks of these keys. */
  clear(keys: string[]): void {
    throw new Error('Not implemented: LoginLimiter.clear');
  }
}
