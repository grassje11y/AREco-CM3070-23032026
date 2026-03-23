import { MATERIAL_TIP } from "../games/Washgame";

describe("wash game MATERIAL_TIP", () => {
  test("covers each material in the item pool", () => {
    expect(Object.keys(MATERIAL_TIP).sort()).toEqual(
      ["glass", "metal", "plastic"].sort()
    );
  });

  test("each tip is non empty string", () => {
    for (const key of Object.keys(MATERIAL_TIP)) {
      expect(typeof MATERIAL_TIP[key]).toBe("string");
      expect(MATERIAL_TIP[key].length).toBeGreaterThan(10);
    }
  });
});
