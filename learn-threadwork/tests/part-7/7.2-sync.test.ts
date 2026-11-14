import { decideSync, debounce } from "@app/shared/sync";

describe("7.2 decideSync", () => {
  it.each([
    [{ localSavedAt: 10, remoteSavedAt: 10, lastSyncedAt: 10 }, "none"],
    [{ localSavedAt: 0, remoteSavedAt: 0, lastSyncedAt: 0 }, "none"],
    [{ localSavedAt: 20, remoteSavedAt: 10, lastSyncedAt: 10 }, "push"],
    [{ localSavedAt: 5, remoteSavedAt: 0, lastSyncedAt: 0 }, "push"],
    [{ localSavedAt: 10, remoteSavedAt: 30, lastSyncedAt: 10 }, "pull"],
    [{ localSavedAt: 0, remoteSavedAt: 30, lastSyncedAt: 0 }, "pull"],
    [{ localSavedAt: 25, remoteSavedAt: 30, lastSyncedAt: 10 }, "conflict"],
    [{ localSavedAt: 8, remoteSavedAt: 6, lastSyncedAt: 10 }, "push"],
  ] as const)("%j -> %s", (info, out) => expect(decideSync(info)).toBe(out));
});

describe("7.2 debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it("runs once with the last arguments after the wait", () => {
    const fn = vi.fn();
    const d = debounce(fn, 500);
    d(1); vi.advanceTimersByTime(300); d(2); vi.advanceTimersByTime(300); d(3);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });
  it("flushes and cancels", () => {
    const fn = vi.fn();
    const d = debounce(fn, 500);
    d("a"); d.flush();
    expect(fn).toHaveBeenCalledWith("a");
    d.flush();
    expect(fn).toHaveBeenCalledTimes(1);
    d("b"); d.cancel(); vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
