import { parseDailyChallengeAwards } from "../constants/challengeStorageParse";

describe("parseDailyChallengeAwards", () => {
  const today = "2024-08-01";

  test("null and null returns empty object", () => {
    expect(parseDailyChallengeAwards(null, null, today)).toEqual({});
  });

  test("parses new format json object", () => {
    const payload = { "2024-07-01": { "scan-1-item": true } };
    expect(
      parseDailyChallengeAwards(JSON.stringify(payload), null, today)
    ).toEqual(payload);
  });

  test("bad json in new format returns empty object", () => {
    expect(parseDailyChallengeAwards("{not json", null, today)).toEqual({});
  });

  test("array json is rejected", () => {
    expect(parseDailyChallengeAwards("[1,2]", null, today)).toEqual({});
  });

  test("migrates old awarded key under today", () => {
    const old = { "scan-1-item": true };
    expect(parseDailyChallengeAwards(null, JSON.stringify(old), today)).toEqual({
      [today]: old,
    });
  });

  test("prefers new format when both would exist", () => {
    const newer = { a: 1 };
    const older = { b: 2 };
    expect(
      parseDailyChallengeAwards(JSON.stringify(newer), JSON.stringify(older), today)
    ).toEqual(newer);
  });
});
