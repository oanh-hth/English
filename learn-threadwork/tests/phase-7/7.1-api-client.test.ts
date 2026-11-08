import { createApi, ApiError } from "@app/client/src/api/client";

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("7.1 createApi", () => {
  it("logs in and returns the token", async () => {
    const fetchFn = vi.fn(async () => json(200, { token: "tok" }));
    const api = createApi({ baseUrl: "http://x", fetchFn });
    expect(await api.login("me@example.com", "pw")).toBe("tok");
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://x/api/auth/login");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ email: "me@example.com", password: "pw" });
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });
  it("sends the token when there is one", async () => {
    const fetchFn = vi.fn(async () => json(200, { state: { a: 1 }, savedAt: 3 }));
    const api = createApi({ fetchFn, getToken: () => "abc" });
    expect(await api.getState()).toEqual({ state: { a: 1 }, savedAt: 3 });
    const init = (fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer abc");
  });
  it("leaves Authorization out without a token", async () => {
    const fetchFn = vi.fn(async () => json(200, { ok: true }));
    await createApi({ fetchFn }).health();
    const init = (fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });
  it("puts state and builds the weather URL", async () => {
    const fetchFn = vi.fn(async (url: string) => (url.includes("weather") ? json(200, { kind: "sun" }) : json(200, { ok: true })));
    const api = createApi({ fetchFn: fetchFn as unknown as typeof fetch });
    await api.putState({ t: 1 }, 20, 10);
    expect(JSON.parse((fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)).toEqual({ state: { t: 1 }, savedAt: 20, baseSavedAt: 10 });
    expect(await api.weather(10.8, 106.6)).toEqual({ kind: "sun" });
    expect(fetchFn.mock.calls[1]![0]).toBe("/api/weather?lat=10.8&lon=106.6");
  });
  it("turns server errors into ApiError with the server's message", async () => {
    const api = createApi({ fetchFn: async () => json(401, { error: "Email or password is wrong" }) });
    const err = await api.login("a@b.co", "x").catch(e => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 401, message: "Email or password is wrong" });
  });
  it("uses a generic message when the body has none", async () => {
    const api = createApi({ fetchFn: async () => new Response("<html>oops</html>", { status: 500 }) });
    await expect(api.health()).rejects.toMatchObject({ status: 500, message: "Request failed (500)" });
  });
  it("explains network failures", async () => {
    const api = createApi({ fetchFn: async () => { throw new TypeError("Failed to fetch"); } });
    await expect(api.health()).rejects.toMatchObject({ status: 0, message: "Can't reach the server. Check your connection." });
  });
  it("returns undefined for 204", async () => {
    const api = createApi({ fetchFn: async () => new Response(null, { status: 204 }) });
    await expect(api.putState({}, 1, 0)).resolves.toBeUndefined();
  });
});
