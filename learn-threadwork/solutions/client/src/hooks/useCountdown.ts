import { useEffect, useRef, useState } from "react";

export interface Countdown {
  remaining: number;
  running: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function useCountdown(seconds: number, onDone: () => void): Countdown {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && remaining <= 0) {
      setRunning(false);
      setRemaining(seconds);
      done.current();
    }
  }, [remaining, running, seconds]);

  return {
    remaining,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: () => { setRunning(false); setRemaining(seconds); },
  };
}
