// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@app/client/src/hooks/useLocalStorage";

beforeEach(() => localStorage.clear());

describe("4.1 useLocalStorage", () => {
  it("starts with the initial value", () => {
    const { result } = renderHook(() => useLocalStorage("k", 5));
    expect(result.current[0]).toBe(5);
  });
  it("reads a saved value", () => {
    localStorage.setItem("k", JSON.stringify({ a: 1 }));
    const { result } = renderHook(() => useLocalStorage("k", { a: 0 }));
    expect(result.current[0]).toEqual({ a: 1 });
  });
  it("falls back on invalid JSON", () => {
    localStorage.setItem("k", "{oops");
    const { result } = renderHook(() => useLocalStorage("k", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });
  it("saves values and updater functions", () => {
    const { result } = renderHook(() => useLocalStorage("count", 1));
    act(() => result.current[1](3));
    act(() => result.current[1](n => n + 1));
    expect(result.current[0]).toBe(4);
    expect(localStorage.getItem("count")).toBe("4");
  });
  it("reads localStorage only on the first render", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem");
    const { result } = renderHook(() => useLocalStorage("k", 0));
    act(() => result.current[1](1));
    act(() => result.current[1](2));
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it("keeps working when storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("QuotaExceeded"); });
    const { result } = renderHook(() => useLocalStorage("k", 0));
    act(() => result.current[1](9));
    expect(result.current[0]).toBe(9);
  });
});
