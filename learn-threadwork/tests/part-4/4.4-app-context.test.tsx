// @vitest-environment jsdom
import { StrictMode } from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider, useApp } from "@app/client/src/state/AppContext";
import { initialState } from "@app/client/src/state/appReducer";

function Probe() {
  const { state, dispatch } = useApp();
  return (
    <div>
      <p>Tasks: {state.tasks.length}</p>
      <button onClick={() => dispatch({ type: "addTask", id: String(state.tasks.length + 1), title: "New", today: "2026-11-08" })}>add</button>
    </div>
  );
}

beforeEach(() => localStorage.clear());

describe("4.4 AppProvider / useApp", () => {
  it("shares state and dispatch with children", async () => {
    render(<AppProvider><Probe /></AppProvider>);
    expect(screen.getByText("Tasks: 0")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "add" }));
    expect(screen.getByText("Tasks: 1")).toBeInTheDocument();
  });
  it("saves changes and restores them", async () => {
    const { unmount } = render(<AppProvider storageKey="s1"><Probe /></AppProvider>);
    await userEvent.click(screen.getByRole("button", { name: "add" }));
    expect(JSON.parse(localStorage.getItem("s1")!).tasks).toHaveLength(1);
    unmount();
    render(<AppProvider storageKey="s1"><Probe /></AppProvider>);
    expect(screen.getByText("Tasks: 1")).toBeInTheDocument();
  });
  it("does not save or notify on the first render", () => {
    const onChange = vi.fn();
    render(<AppProvider storageKey="s2" onChange={onChange}><Probe /></AppProvider>);
    expect(localStorage.getItem("s2")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });
  it("does not notify when StrictMode runs effects twice", async () => {
    const onChange = vi.fn();
    render(<StrictMode><AppProvider storageKey="s3" onChange={onChange}><Probe /></AppProvider></StrictMode>);
    expect(onChange).not.toHaveBeenCalled();
    expect(localStorage.getItem("s3")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "add" }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
  it("calls onChange after each change", async () => {
    const onChange = vi.fn();
    render(<AppProvider onChange={onChange}><Probe /></AppProvider>);
    await userEvent.click(screen.getByRole("button", { name: "add" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0].tasks).toHaveLength(1);
  });
  it("fills in fields missing from older saved data", () => {
    localStorage.setItem("old", JSON.stringify({ tasks: [], garden: initialState.garden, streak: initialState.streak, focusSessions: 2 }));
    let seen: { notes?: unknown[]; focusSessions?: number } = {};
    function Peek() { seen = useApp().state; return null; }
    render(<AppProvider storageKey="old"><Peek /></AppProvider>);
    expect(seen.focusSessions).toBe(2);
    expect(seen.notes).toEqual([]);
  });
  it("ignores broken saved data", () => {
    localStorage.setItem("threadwork.state", "{broken");
    render(<AppProvider><Probe /></AppProvider>);
    expect(screen.getByText("Tasks: 0")).toBeInTheDocument();
  });
  it("useApp outside a provider explains the problem", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow("useApp must be used inside <AppProvider>");
  });
  it("starts from initialState", () => {
    let seen: unknown;
    function Peek() { seen = useApp().state; return null; }
    act(() => { render(<AppProvider><Peek /></AppProvider>); });
    expect(seen).toEqual(initialState);
  });
});
