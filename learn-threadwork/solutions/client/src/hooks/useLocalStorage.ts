import { useCallback, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue(prev => {
      const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* keep the in-memory value */ }
      return value;
    });
  }, [key]);

  return [value, set];
}
