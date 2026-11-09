// Exercise 7.9: Badge toasts. Read curriculum/part-7/d-weather-and-motion.md first.
import type { Stats } from "@app/shared/badges";

export interface BadgeToast { id: string; name: string; description: string }

/**
 * Watches `stats` (from computeStats in 2.4). When a render has newly earned badges compared with the previous
 * render (newBadges from 2.4), add a toast for each (name and description from BADGES).
 * - No toasts for badges that were already earned on the first render.
 * - Each toast disappears after `ms` (default 4000). dismiss(id) removes one now.
 * - Clear pending timers on unmount.
 */
export function useBadgeToasts(stats: Stats, ms = 4000): { toasts: BadgeToast[]; dismiss: (id: string) => void } {
  // TODO 7.9
  return { toasts: [], dismiss: () => {} };
}
