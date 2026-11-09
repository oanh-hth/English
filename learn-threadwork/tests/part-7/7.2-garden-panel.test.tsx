// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GardenPanel } from "@app/client/src/components/GardenPanel";
import { initialGarden } from "@app/shared/garden";
import type { GardenState } from "@app/shared/types";

const g = (extra: Partial<GardenState> = {}): GardenState => ({ ...initialGarden, ...extra });
const oneHarvest = [{ kind: "tomato" as const, fruits: 5, day: "2026-11-01" }];

describe("GardenPanel", () => {
  it("shows the plant, stage and growth", () => {
    render(<GardenPanel garden={g({ growth: 57.6 })} onHarvest={() => {}} onChooseSeed={() => {}} />);
    const box = screen.getByRole("region", { name: "Garden" });
    expect(within(box).getByRole("heading", { name: "Tomato · Flowering" })).toBeInTheDocument();
    expect(screen.getByLabelText("Growth")).toHaveAttribute("value", "58");
    expect(screen.getByText("7% to fruiting")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Harvest/ })).toBeNull();
    expect(screen.getByText("0 harvests so far")).toBeInTheDocument();
  });
  it("harvests when ripe", async () => {
    const onHarvest = vi.fn();
    render(<GardenPanel garden={g({ growth: 100, kind: "chili", harvests: oneHarvest })} onHarvest={onHarvest} onChooseSeed={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Harvest 6 chilies" }));
    expect(onHarvest).toHaveBeenCalled();
    expect(screen.getByText("1 harvest so far")).toBeInTheDocument();
  });
  it("offers seed packets, locked until earned", async () => {
    const onChooseSeed = vi.fn();
    render(<GardenPanel garden={g({ harvests: oneHarvest, nextKind: "tomato" })} onHarvest={() => {}} onChooseSeed={onChooseSeed} />);
    expect(screen.getByRole("button", { name: "Tomato" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Lemon tree/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Lemon tree/ })).toHaveTextContent("Unlocks after 3 harvests");
    expect(screen.getByRole("button", { name: /Chili/ })).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: /Chili/ }));
    expect(onChooseSeed).toHaveBeenCalledWith("chili");
  });
});
