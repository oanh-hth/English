// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { Plant, plantParts } from "@app/client/src/components/Plant";

describe("5.1 plantParts", () => {
  it.each([
    [0, "tomato", { seed: true, leaves: 0, flowers: 0, fruits: 0, ripe: false }],
    [5, "tomato", { seed: false, leaves: 2, flowers: 0, fruits: 0, ripe: false }],
    [40, "tomato", { seed: false, leaves: 7, flowers: 0, fruits: 0, ripe: false }],
    [58, "tomato", { seed: false, leaves: 9, flowers: 2, fruits: 0, ripe: false }],
    [72, "tomato", { seed: false, leaves: 11, flowers: 2, fruits: 2, ripe: false }],
    [100, "tomato", { seed: false, leaves: 12, flowers: 0, fruits: 5, ripe: true }],
    [100, "chili", { seed: false, leaves: 12, flowers: 0, fruits: 6, ripe: true }],
    [130, "lemon", { seed: false, leaves: 12, flowers: 0, fruits: 4, ripe: true }],
    [-5, "lemon", { seed: true, leaves: 0, flowers: 0, fruits: 0, ripe: false }],
  ] as const)("growth %s %s", (g, kind, parts) => {
    expect(plantParts(g, kind)).toEqual(parts);
  });
});

describe("5.1 <Plant>", () => {
  const count = (part: string) => document.querySelectorAll(`[data-part="${part}"]`).length;
  it("describes itself for screen readers", () => {
    render(<Plant growth={57.6} kind="tomato" />);
    expect(screen.getByRole("img", { name: "Tomato, 58% grown, Flowering" })).toBeInTheDocument();
  });
  it("draws the parts", () => {
    render(<Plant growth={72} kind="tomato" />);
    expect([count("seed"), count("leaf"), count("flower"), count("fruit")]).toEqual([0, 11, 2, 2]);
  });
  it("draws a seed at the start", () => {
    render(<Plant growth={0} kind="chili" />);
    expect(count("seed")).toBe(1);
    expect(screen.getByRole("img", { name: "Chili, 0% grown, Seed" })).toBeInTheDocument();
  });
  it("marks ripe fruit", () => {
    render(<Plant growth={100} kind="tomato" />);
    expect(document.querySelectorAll('[data-part="fruit"][data-ripe="true"]').length).toBe(5);
  });
});
