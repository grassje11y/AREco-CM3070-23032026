import { SORT_BINS, SORT_POOL } from "../games/Sortingame";

describe("sorting game data", () => {
  const binIds = new Set(SORT_BINS.map((b) => b.id));

  test("every sortable item category maps to a bin id", () => {
    for (const item of SORT_POOL) {
      expect(binIds.has(item.category)).toBe(true);
    }
  });

  test("bins have expected recycling stream ids", () => {
    expect(binIds.has("paper")).toBe(true);
    expect(binIds.has("plastic")).toBe(true);
    expect(binIds.has("glass")).toBe(true);
    expect(binIds.has("metal")).toBe(true);
    expect(binIds.has("trash")).toBe(true);
  });
});
