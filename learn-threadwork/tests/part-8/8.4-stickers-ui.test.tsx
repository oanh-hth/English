// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sticker, StickerPicker } from "@app/client/src/components/Stickers";

describe("8.4 Sticker", () => {
  it("draws a named sticker", () => {
    render(<Sticker id="rocket" />);
    const img = screen.getByRole("img", { name: "Sticker: Shipped" });
    expect(img).toHaveClass("sticker");
    expect(img.querySelector("svg")).not.toBeNull();
  });
  it("can be small, and is nothing for unknown ids", () => {
    const { container } = render(<><Sticker id="star" small /><Sticker id="unicorn" /></>);
    expect(screen.getByRole("img", { name: "Sticker: Proud" })).toHaveClass("sticker", "small");
    expect(container.querySelectorAll(".sticker")).toHaveLength(1);
  });
});

describe("8.4 StickerPicker", () => {
  it("offers None and every sticker", () => {
    render(<StickerPicker value={null} onChange={() => {}} />);
    const group = screen.getByRole("group", { name: "Sticker" });
    const radios = within(group).getAllByRole("radio");
    expect(radios).toHaveLength(9);
    expect(screen.getByRole("radio", { name: "None" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Gotcha" })).toBeInTheDocument();
  });
  it("shows and changes the choice", async () => {
    const onChange = vi.fn();
    render(<StickerPicker value="heart" onChange={onChange} />);
    expect(screen.getByRole("radio", { name: "Loved it" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Insight" }));
    await userEvent.click(screen.getByRole("radio", { name: "None" }));
    expect(onChange.mock.calls).toEqual([["idea"], [null]]);
  });
});
