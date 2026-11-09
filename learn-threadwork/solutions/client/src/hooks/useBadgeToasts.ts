import { useCallback, useEffect, useRef, useState } from "react";
import { BADGES, newBadges, type Stats } from "@app/shared/badges";

export interface BadgeToast { id: string; name: string; description: string }

export function useBadgeToasts(stats: Stats, ms = 4000): { toasts: BadgeToast[]; dismiss: (id: string) => void } {
  const [toasts, setToasts] = useState<BadgeToast[]>([]);
  const previous = useRef(stats);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const fresh = newBadges(previous.current, stats);
    previous.current = stats;
    if (!fresh.length) return;
    const add = fresh.map(id => BADGES.find(b => b.id === id)!).map(b => ({ id: b.id, name: b.name, description: b.description }));
    setToasts(ts => [...ts, ...add]);
    for (const t of add) timers.current.set(t.id, setTimeout(() => dismiss(t.id), ms));
  }, [stats, ms, dismiss]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current.clear(); }, []);

  return { toasts, dismiss };
}
