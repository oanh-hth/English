// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { useBadgeToasts } from "@app/client/src/hooks/useBadgeToasts";
import type { Stats } from "@app/shared/badges";

const base: Stats = { finished: 0, finishedCritical: 0, linkPairs: 0, resourcesUsed: 0, harvests: 0, streak: 0, focusSessions: 0 };

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useBadgeToasts", () => {
  it("ignores badges you already had", () => {
    const { result } = renderHook(({ s }) => useBadgeToasts(s), { initialProps: { s: { ...base, finished: 3 } } });
    expect(result.current.toasts).toEqual([]);
  });
  it("toasts new badges and hides them later", () => {
    const { result, rerender } = renderHook(({ s }) => useBadgeToasts(s), { initialProps: { s: base } });
    rerender({ s: { ...base, finished: 1, finishedCritical: 1 } });
    expect(result.current.toasts.map(t => t.name)).toEqual(["First sprout", "Big push"]);
    expect(result.current.toasts[0]!.description).toBe("Finish your first task");
    act(() => { vi.advanceTimersByTime(4000); });
    expect(result.current.toasts).toEqual([]);
  });
  it("dismisses one toast", () => {
    const { result, rerender } = renderHook(({ s }) => useBadgeToasts(s, 1000), { initialProps: { s: base } });
    rerender({ s: { ...base, finished: 1, streak: 3 } });
    act(() => result.current.dismiss("first-sprout"));
    expect(result.current.toasts.map(t => t.id)).toEqual(["on-a-roll"]);
  });
  it("does not repeat a toast when nothing new happened", () => {
    const { result, rerender } = renderHook(({ s }) => useBadgeToasts(s), { initialProps: { s: base } });
    const earned = { ...base, finished: 1 };
    rerender({ s: earned });
    rerender({ s: { ...earned } });
    expect(result.current.toasts).toHaveLength(1);
  });
  it("clears timers on unmount", () => {
    const { rerender, unmount } = renderHook(({ s }) => useBadgeToasts(s), { initialProps: { s: base } });
    rerender({ s: { ...base, finished: 1 } });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
