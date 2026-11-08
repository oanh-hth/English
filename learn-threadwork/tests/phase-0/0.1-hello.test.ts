import { greet } from "@app/shared/hello";

describe("0.1 greet", () => {
  it("greets by name", () => {
    expect(greet("Oanh")).toBe("Hello, Oanh!");
  });
  it("works for any name", () => {
    expect(greet("Threadwork")).toBe("Hello, Threadwork!");
  });
});
