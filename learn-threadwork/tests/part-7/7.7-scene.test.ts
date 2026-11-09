import { sceneFor } from "@app/client/src/garden/scene";

describe("sceneFor", () => {
  it("sunny day", () => expect(sceneFor("sun", true, 10)).toEqual({ sky: "day", parts: ["sun"], pollinators: true, watered: false, label: "Sunny · Day" }));
  it("clear night", () => expect(sceneFor("sun", false, 22)).toEqual({ sky: "night", parts: ["stars", "moon"], pollinators: false, watered: false, label: "Sunny · Night" }));
  it("rainy day waters the plant", () => expect(sceneFor("rain", true, 14)).toEqual({ sky: "day", parts: ["clouds", "rain"], pollinators: false, watered: true, label: "Rain · Day" }));
  it("snowy night", () => expect(sceneFor("snow", false, 2).parts).toEqual(["stars", "moon", "clouds", "snow"]));
  it("windy day", () => expect(sceneFor("wind", true, 9)).toMatchObject({ parts: ["sun", "clouds", "gusts"], pollinators: true, label: "Windy · Day" }));
  it("cloudy day", () => expect(sceneFor("cloud", true, 9)).toMatchObject({ parts: ["clouds"], pollinators: true }));
  it("uses the clock when day/night is unknown", () => {
    expect(sceneFor(null, null, 18).sky).toBe("day");
    expect(sceneFor(null, null, 19).sky).toBe("night");
    expect(sceneFor(null, null, 5).sky).toBe("night");
    expect(sceneFor(null, null, 6)).toMatchObject({ sky: "day", label: "Sunny · Day" });
  });
});
