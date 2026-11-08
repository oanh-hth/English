export interface LoginLimiterOptions {
  maxFails?: number;
  lockMs?: number;
  now?: () => number;
}

export class LoginLimiter {
  private entries = new Map<string, { count: number; lockedUntil: number }>();
  private maxFails: number;
  private lockMs: number;
  private now: () => number;

  constructor(options: LoginLimiterOptions = {}) {
    this.maxFails = options.maxFails ?? 5;
    this.lockMs = options.lockMs ?? 15 * 60 * 1000;
    this.now = options.now ?? Date.now;
  }

  isLocked(keys: string[]): boolean {
    return keys.some((key) => (this.entries.get(key)?.lockedUntil ?? 0) > this.now());
  }

  recordFailure(keys: string[]): void {
    for (const key of keys) {
      const entry = this.entries.get(key) ?? { count: 0, lockedUntil: 0 };
      entry.count += 1;
      if (entry.count >= this.maxFails) {
        entry.lockedUntil = this.now() + this.lockMs;
        entry.count = 0;
      }
      this.entries.set(key, entry);
    }
  }

  clear(keys: string[]): void {
    for (const key of keys) this.entries.delete(key);
  }
}
