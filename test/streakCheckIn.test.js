import { computeDailyCheckIn } from "../constants/streakCheckIn";

describe("computeDailyCheckIn", () => {
  const todayKey = "2024-06-16";
  const yesterdayKey = "2024-06-15";

  test("does nothing when already checked in today", () => {
    const r = computeDailyCheckIn({
      lastCheckInDate: todayKey,
      streak: 3,
      todayKey,
      yesterdayKey,
    });
    expect(r.applied).toBe(false);
  });

  test("first ever check in sets streak 1 and five points", () => {
    const r = computeDailyCheckIn({
      lastCheckInDate: null,
      streak: 0,
      todayKey,
      yesterdayKey,
    });
    expect(r.applied).toBe(true);
    expect(r.nextStreak).toBe(1);
    expect(r.pointsToAdd).toBe(5);
    expect(r.newLastCheckInDate).toBe(todayKey);
  });

  test("continues streak when last check in was yesterday", () => {
    const r = computeDailyCheckIn({
      lastCheckInDate: yesterdayKey,
      streak: 4,
      todayKey,
      yesterdayKey,
    });
    expect(r.applied).toBe(true);
    expect(r.nextStreak).toBe(5);
    expect(r.pointsToAdd).toBe(5);
  });

  test("breaks streak to 1 when last check in is older than yesterday", () => {
    const r = computeDailyCheckIn({
      lastCheckInDate: "2024-06-10",
      streak: 9,
      todayKey,
      yesterdayKey,
    });
    expect(r.applied).toBe(true);
    expect(r.nextStreak).toBe(1);
    expect(r.pointsToAdd).toBe(5);
  });

  test("adds fifty bonus when streak reaches seven", () => {
    const r = computeDailyCheckIn({
      lastCheckInDate: yesterdayKey,
      streak: 6,
      todayKey,
      yesterdayKey,
    });
    expect(r.nextStreak).toBe(7);
    expect(r.pointsToAdd).toBe(55);
  });
});
