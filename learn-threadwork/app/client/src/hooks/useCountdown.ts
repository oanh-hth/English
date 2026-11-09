// Exercise 4.2: useCountdown, the focus timer. Read curriculum/part-4/a-custom-hooks.md first.

export interface Countdown {
  remaining: number;       // seconds left
  running: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

/**
 * A focus timer. Counts down once per second while running.
 * - At 0: stop, call onDone() exactly once, and go back to `seconds` (ready for the next session).
 * - pause keeps the remaining time; reset stops and goes back to `seconds`.
 * - Clean up the interval when paused or unmounted (no timers left behind).
 */
export function useCountdown(seconds: number, onDone: () => void): Countdown {
  // TODO 4.2
  return { remaining: seconds, running: false, start: () => {}, pause: () => {}, reset: () => {} };
}
