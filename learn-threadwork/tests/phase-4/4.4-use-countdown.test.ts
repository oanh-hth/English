// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "@app/client/src/hooks/useCountdown";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("4.4 useCountdown", () => {
  it("counts down while running", () => {
    const { result } = renderHook(() => useCountdown(10, () => {}));
    expect(result.current).toMatchObject({ remaining: 10, running: false });
    act(() => result.current.start());
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current).toMatchObject({ remaining: 7, running: true });
  });
  it("pauses and resumes", () => {
    const { result } = renderHook(() => useCountdown(10, () => {}));
    act(() => result.current.start());
    act(() => { vi.advanceTimersByTime(2000); });
    act(() => result.current.pause());
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.remaining).toBe(8);
    act(() => result.current.start());
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.remaining).toBe(7);
  });
  it("calls onDone once at zero and resets", () => {
    const onDone = vi.fn();
    const { result } = renderHook(() => useCountdown(3, onDone));
    act(() => result.current.start());
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(result.current).toMatchObject({ remaining: 3, running: false });
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onDone).toHaveBeenCalledTimes(1);
  });
  it("reset stops and restores", () => {
    const { result } = renderHook(() => useCountdown(5, () => {}));
    act(() => result.current.start());
    act(() => { vi.advanceTimersByTime(2000); });
    act(() => result.current.reset());
    expect(result.current).toMatchObject({ remaining: 5, running: false });
  });
  it("leaves no timers behind after unmount", () => {
    const { result, unmount } = renderHook(() => useCountdown(5, () => {}));
    act(() => result.current.start());
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
