// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TreatShop, type TreatShopProps } from "@app/client/src/components/TreatShop";

function setup(extra: Partial<TreatShopProps> = {}) {
  const props: TreatShopProps = {
    treats: [{ id: "coffee", name: "Coffee walk", cost: 1 }, { id: "episode", name: "One episode", cost: 5 }],
    harvests: [{ kind: "tomato", fruits: 5, day: "2026-11-01" }],
    claimed: [{ treatId: "coffee", name: "Coffee walk", cost: 1, day: "2026-11-02" }],
    onClaim: vi.fn(), onAdd: vi.fn(), ...extra };
  render(<TreatShop {...props} />);
  return props;
}

describe("TreatShop", () => {
  it("shows fruit to spend and claims affordable treats", async () => {
    const p = setup();
    expect(screen.getByRole("region", { name: "Treat shop" })).toHaveTextContent("4 fruit to spend");
    await userEvent.click(screen.getByRole("button", { name: "Claim Coffee walk" }));
    expect(p.onClaim).toHaveBeenCalledWith("coffee");
  });
  it("disables treats you can't afford and says how much is missing", () => {
    setup();
    const b = screen.getByRole("button", { name: "Claim One episode" });
    expect(b).toBeDisabled();
    expect(b).toHaveTextContent("1 more fruit");
  });
  it("adds your own treat", async () => {
    const p = setup();
    await userEvent.type(screen.getByLabelText("Treat"), "Movie night");
    await userEvent.clear(screen.getByLabelText("Cost"));
    await userEvent.type(screen.getByLabelText("Cost"), "8");
    await userEvent.click(screen.getByRole("button", { name: "Add treat" }));
    expect(p.onAdd).toHaveBeenCalledWith("Movie night", 8);
    expect(screen.getByLabelText("Treat")).toHaveValue("");
    await userEvent.click(screen.getByRole("button", { name: "Add treat" }));
    expect(p.onAdd).toHaveBeenCalledTimes(1);
  });
  it("lists recent claims, newest first", () => {
    const claimed = ["1", "2", "3", "4", "5", "6"].map(d => ({ treatId: "c", name: `Treat ${d}`, cost: 0, day: `2026-11-0${d}` }));
    setup({ claimed, harvests: [] });
    const items = screen.getAllByText(/^Treat \d · /).map(e => e.textContent);
    expect(items).toEqual(["Treat 6 · 2026-11-06", "Treat 5 · 2026-11-05", "Treat 4 · 2026-11-04", "Treat 3 · 2026-11-03", "Treat 2 · 2026-11-02"]);
  });
});
