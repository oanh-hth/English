// @vitest-environment jsdom
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemePicker } from "@app/client/src/components/ThemePicker";

function Controlled({ start, onChange }: { start: string; onChange?: (id: string) => void }) {
  const [v, setV] = useState(start);
  return <ThemePicker value={v} onChange={id => { setV(id); onChange?.(id); }} />;
}

describe("8.1 ThemePicker", () => {
  it("is a radio group of themes with previews", () => {
    render(<ThemePicker value="cozy" onChange={() => {}} />);
    expect(screen.getAllByRole("radio")).toHaveLength(6);
    for (const name of ["Coffee shop", "Cozy room", "Library", "Rainy window", "Night city", "Plain"]) expect(screen.getByRole("radio", { name })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Background" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Cozy room" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Library" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: "Coffee shop" }).querySelector("svg")).not.toBeNull();
  });
  it("has one tab stop: the checked theme", () => {
    render(<ThemePicker value="library" onChange={() => {}} />);
    expect(screen.getAllByRole("radio").map(r => r.getAttribute("tabindex"))).toEqual(["-1", "-1", "0", "-1", "-1", "-1"]);
  });
  it("chooses by click", async () => {
    const onChange = vi.fn();
    render(<ThemePicker value="coffee" onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Night city" }));
    expect(onChange).toHaveBeenCalledWith("city");
  });
  it("moves with arrow keys, wrapping around", async () => {
    const onChange = vi.fn();
    render(<Controlled start="plain" onChange={onChange} />);
    screen.getByRole("radio", { name: "Plain" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Coffee shop" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(onChange.mock.calls.map(c => c[0])).toEqual(["coffee", "plain", "city"]);
    expect(screen.getByRole("radio", { name: "Night city" })).toHaveAttribute("aria-checked", "true");
  });
});
