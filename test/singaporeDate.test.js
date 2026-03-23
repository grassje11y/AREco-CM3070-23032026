import {
  getSingaporeDateKey,
  getSingaporeYesterdayKey,
} from "../constants/singaporeDate";

describe("singapore date keys", () => {
  test("getSingaporeDateKey uses Asia/Singapore calendar day", () => {
    // 15 jun 2024 16:00 utc = 16 jun 2024 00:00 in singapore
    const ref = new Date("2024-06-15T16:00:00.000Z");
    expect(getSingaporeDateKey(ref)).toBe("2024-06-16");
  });

  test("getSingaporeYesterdayKey is the previous local day in singapore", () => {
    const ref = new Date("2024-06-15T16:00:00.000Z");
    expect(getSingaporeDateKey(ref)).toBe("2024-06-16");
    expect(getSingaporeYesterdayKey(ref)).toBe("2024-06-15");
  });

  test("keys look like yyyy-mm-dd", () => {
    const ref = new Date("2020-01-05T12:00:00.000Z");
    const key = getSingaporeDateKey(ref);
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
