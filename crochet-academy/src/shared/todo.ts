/**
 * Every exercise starts as a stub that calls todo('<exercise id>').
 * Tests fail with a clear message, and the running app shows a friendly
 * "build exercise X to unlock this" card instead of crashing.
 */
export class NotImplementedError extends Error {
  constructor(public readonly exercise: string) {
    super(`Exercise ${exercise} is not built yet`);
    this.name = 'NotImplementedError';
  }
}

export function todo(exercise: string): never {
  throw new NotImplementedError(exercise);
}
