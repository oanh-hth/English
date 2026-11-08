// Exercise 4.1: your first custom hook. See curriculum/phase-4-state-and-hooks/4.1-use-local-storage.md
import { useState } from "react";

/**
 * Like useState, but the value is saved in localStorage under `key` as JSON.
 * - Read localStorage only once, on the first render (lazy initial state).
 * - Missing key or invalid JSON: use `initial`.
 * - The setter accepts a value or an updater function, like useState's setter.
 * - If localStorage throws (private mode, quota full), keep working in memory.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
  // TODO 4.1
  const [value, setValue] = useState(initial);
  return [value, setValue];
}
