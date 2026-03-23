import {
  ALL_CHALLENGES,
  getChallengeById,
  pickDailyChallengeIds,
  isChallengeComplete,
} from "../constants/challenges";

describe("ALL_CHALLENGES", () => {
  test("every challenge has id title description screen", () => {
    for (const c of ALL_CHALLENGES) {
      expect(typeof c.id).toBe("string");
      expect(c.id.length).toBeGreaterThan(0);
      expect(typeof c.title).toBe("string");
      expect(typeof c.description).toBe("string");
      expect(typeof c.screen).toBe("string");
    }
  });

  test("ids are unique", () => {
    const ids = ALL_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getChallengeById", () => {
  test("returns the challenge for a known id", () => {
    const c = getChallengeById("scan-1-item");
    expect(c?.id).toBe("scan-1-item");
    expect(c?.screen).toBe("scanner");
  });

  test("returns undefined for unknown id", () => {
    expect(getChallengeById("not-real")).toBeUndefined();
  });
});

describe("pickDailyChallengeIds", () => {
  const key = "2024-03-15";

  test("same date always returns the same ids", () => {
    const a = pickDailyChallengeIds(key, 3);
    const b = pickDailyChallengeIds(key, 3);
    expect(a).toEqual(b);
  });

  test("respects count up to pool size", () => {
    expect(pickDailyChallengeIds(key, 1)).toHaveLength(1);
    expect(pickDailyChallengeIds(key, ALL_CHALLENGES.length)).toHaveLength(
      ALL_CHALLENGES.length
    );
    expect(pickDailyChallengeIds(key, 999)).toHaveLength(ALL_CHALLENGES.length);
  });

  test("returns distinct ids", () => {
    const picked = pickDailyChallengeIds(key, 5);
    expect(new Set(picked).size).toBe(picked.length);
  });

  test("different dates can produce different picks", () => {
    const a = pickDailyChallengeIds("2024-01-01", 3).join(",");
    const b = pickDailyChallengeIds("2024-12-31", 3).join(",");
    expect(a === b).toBe(false);
  });
});

describe("isChallengeComplete", () => {
  const base = {
    history: [],
    visitedScreens: {},
    gamePlayed: false,
    chatUsed: false,
    hasCheckedInToday: false,
  };

  test("scan-1-item when at least one history row", () => {
    expect(isChallengeComplete("scan-1-item", base)).toBe(false);
    expect(isChallengeComplete("scan-1-item", { ...base, history: [{}] })).toBe(
      true
    );
  });

  test("scan-3-items needs three scans", () => {
    expect(isChallengeComplete("scan-3-items", { ...base, history: [1, 2] })).toBe(
      false
    );
    expect(
      isChallengeComplete("scan-3-items", { ...base, history: [1, 2, 3] })
    ).toBe(true);
  });

  test("play-game-once", () => {
    expect(isChallengeComplete("play-game-once", base)).toBe(false);
    expect(
      isChallengeComplete("play-game-once", { ...base, gamePlayed: true })
    ).toBe(true);
  });

  test("ask-chatbot", () => {
    expect(isChallengeComplete("ask-chatbot", base)).toBe(false);
    expect(
      isChallengeComplete("ask-chatbot", { ...base, chatUsed: true })
    ).toBe(true);
  });

  test("visitedScreens flags", () => {
    expect(isChallengeComplete("view-history", base)).toBe(false);
    expect(
      isChallengeComplete("view-history", {
        ...base,
        visitedScreens: { history: true },
      })
    ).toBe(true);
    expect(
      isChallengeComplete("nea-search", {
        ...base,
        visitedScreens: { search: true },
      })
    ).toBe(true);
    expect(
      isChallengeComplete("open-settings", {
        ...base,
        visitedScreens: { settings: true },
      })
    ).toBe(true);
    expect(
      isChallengeComplete("visit-prizes", {
        ...base,
        visitedScreens: { prizes: true },
      })
    ).toBe(true);
    expect(
      isChallengeComplete("play-ar", {
        ...base,
        visitedScreens: { ar: true },
      })
    ).toBe(true);
  });

  test("daily-check-in", () => {
    expect(isChallengeComplete("daily-check-in", base)).toBe(false);
    expect(
      isChallengeComplete("daily-check-in", {
        ...base,
        hasCheckedInToday: true,
      })
    ).toBe(true);
  });

  test("unknown id is false", () => {
    expect(isChallengeComplete("fake-id", base)).toBe(false);
  });
});
