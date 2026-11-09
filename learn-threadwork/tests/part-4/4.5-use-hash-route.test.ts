// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { useHashRoute } from "@app/client/src/hooks/useHashRoute";

const ROUTES = ["today", "tasks", "garden"] as const;
const fire = (hash: string) => act(() => { location.hash = hash; window.dispatchEvent(new HashChangeEvent("hashchange")); });

beforeEach(() => { location.hash = ""; });

describe("useHashRoute", () => {
  it("falls back when the hash is empty or unknown", () => {
    location.hash = "#nope";
    const { result } = renderHook(() => useHashRoute(ROUTES, "today"));
    expect(result.current[0]).toBe("today");
  });
  it("reads the current hash", () => {
    location.hash = "#garden";
    const { result } = renderHook(() => useHashRoute(ROUTES, "today"));
    expect(result.current[0]).toBe("garden");
  });
  it("follows hash changes", () => {
    const { result } = renderHook(() => useHashRoute(ROUTES, "today"));
    fire("#tasks");
    expect(result.current[0]).toBe("tasks");
    fire("#unknown");
    expect(result.current[0]).toBe("today");
  });
  it("navigates", () => {
    const { result } = renderHook(() => useHashRoute(ROUTES, "today"));
    act(() => result.current[1]("garden"));
    expect(location.hash).toBe("#garden");
  });
  it("removes its listener on unmount", () => {
    const spy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useHashRoute(ROUTES, "today"));
    unmount();
    expect(spy).toHaveBeenCalledWith("hashchange", expect.any(Function));
  });
});
