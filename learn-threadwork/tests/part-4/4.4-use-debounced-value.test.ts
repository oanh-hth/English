// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "@app/client/src/hooks/useDebouncedValue";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("4.4 useDebouncedValue", () => {
  it("starts with the value", () => {
    const { result } = renderHook(() => useDebouncedValue("css", 300));
    expect(result.current).toBe("css");
  });
  it("waits until the value stops changing", () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), { initialProps: { v: "" } });
    rerender({ v: "r" }); act(() => { vi.advanceTimersByTime(200); });
    rerender({ v: "re" }); act(() => { vi.advanceTimersByTime(200); });
    rerender({ v: "rea" });
    expect(result.current).toBe("");
    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current).toBe("");
    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe("rea");
  });
  it("leaves no timers after unmount", () => {
    const { rerender, unmount } = renderHook(({ v }) => useDebouncedValue(v, 300), { initialProps: { v: "a" } });
    rerender({ v: "b" });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
